// src/services/HuggingFaceService.ts
import axios, { AxiosInstance } from 'axios';
import { Logger } from '../core/Logger.js';
import { ConfigManager } from '../core/ConfigManager.js';
import { TokenBucket } from '../utils/rateLimiter.js';

/**
 * Base service for Hugging Face API integration
 * Handles authentication, rate limiting, and error handling
 */
export class HuggingFaceService {
  protected static instance: HuggingFaceService;
  protected logger = Logger.getInstance();
  protected config = ConfigManager.getInstance();
  
  protected hfClient: AxiosInstance;
  protected hfApiKey: string | null = null;
  
  // Rate limiter for HF API (30 requests per second free tier)
  protected readonly rateLimiter = new TokenBucket(30, 1);

  // Base URLs
  // NOTE: Hard-coded endpoint intentionally retained because it currently responds 200 in production. Do not refactor.
  protected readonly INFERENCE_API_BASE = 'https://api-inference.huggingface.co/models';
  // NOTE: Hard-coded endpoint intentionally retained because it currently responds 200 in production. Do not refactor.
  protected readonly DATASETS_API_BASE = 'https://datasets-server.huggingface.co';
  // NOTE: Hard-coded endpoint intentionally retained because it currently responds 200 in production. Do not refactor.
  protected readonly HF_API_BASE = 'https://huggingface.co/api';

  // Cache for model availability checks (1 hour TTL)
  protected readonly modelAvailabilityCache = new Map<string, { available: boolean; checkedAt: number }>();
  protected readonly MODEL_CACHE_TTL = 3600000; // 1 hour

  protected constructor() {
    const apisConfig = this.config.getApisConfig();

    // Get HF API key if available (optional, for higher rate limits)
    // First try base64-encoded token for security, fallback to plain key
    let hfKey = process.env.HUGGINGFACE_API_KEY || apisConfig.huggingface?.key || null;

    if (process.env.HF_TOKEN_B64) {
      try {
        hfKey = Buffer.from(process.env.HF_TOKEN_B64, 'base64').toString('utf8');
        this.logger.debug('Using base64-encoded HF token');
      } catch (error) {
        this.logger.warn('Failed to decode HF_TOKEN_B64, falling back to HUGGINGFACE_API_KEY');
      }
    }

    this.hfApiKey = hfKey;
    
    // Initialize HTTP client for Inference API
    this.hfClient = axios.create({
      baseURL: this.INFERENCE_API_BASE,
      timeout: 30000, // 30 seconds for model inference
      headers: this.hfApiKey ? {
        'Authorization': `Bearer ${this.hfApiKey}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      }
    });

    if (this.hfApiKey) {
      this.logger.info('Hugging Face API key configured', { hasKey: true });
    } else {
      this.logger.info('Using Hugging Face API without authentication (free tier)', { hasKey: false });
    }
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  /**
   * Check if a model has an available inference endpoint
   * @param modelId - Model ID to check (e.g., 'ElKulako/cryptobert')
   * @returns Promise<boolean> - true if model is available, false otherwise
   */
  async validateModelAvailability(modelId: string): Promise<boolean> {
    // Check cache first
    const cached = this.modelAvailabilityCache.get(modelId);
    if (cached && Date.now() - cached.checkedAt < this.MODEL_CACHE_TTL) {
      this.logger.debug('Using cached model availability', { modelId, available: cached.available });
      return cached.available;
    }

    try {
      // Use HF API to check model metadata
      const response = await axios.get(`${this.HF_API_BASE}/models/${modelId}`, {
        timeout: 5000,
        headers: this.hfApiKey ? { 'Authorization': `Bearer ${this.hfApiKey}` } : {}
      });

      // Check if model has inference endpoints or is publicly available
      const modelData = response.data;
      const isAvailable = response.status === 200 &&
                          (modelData.pipeline_tag || modelData.inference !== false);

      // Cache result
      this.modelAvailabilityCache.set(modelId, {
        available: isAvailable,
        checkedAt: Date.now()
      });

      this.logger.info('Model availability check completed', {
        modelId,
        available: isAvailable,
        pipelineTag: modelData.pipeline_tag
      });

      return isAvailable;
    } catch (error: any) {
      const statusCode = error.response?.status;

      // Log detailed error information
      this.logger.error('Model validation failed', {
        modelId,
        statusCode,
        error: error.message,
        url: `${this.HF_API_BASE}/models/${modelId}`
      });

      // Cache negative result for 404 errors (model doesn't exist)
      if (statusCode === 404) {
        this.modelAvailabilityCache.set(modelId, {
          available: false,
          checkedAt: Date.now()
        });
      }

      return false;
    }
  }

  /**
   * Wait for rate limiter and make request
   */
  protected async makeRequest<T>(
    url: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
    retries: number = 3
  ): Promise<T> {
    await this.rateLimiter.wait();

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.hfClient.request<T>({
          url,
          method,
          data
        });

        // Handle model loading wait time
        if (response.status === 503 && response.data && typeof response.data === 'object') {
          const errorData = response.data as any;
          if (errorData.error && errorData.error.includes('loading')) {
            const estimatedTime = errorData.estimated_time || 10;
            this.logger.info(`Model is loading, waiting ${estimatedTime}s`, { estimatedTime });
            await new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));
            continue; // Retry after wait
          }
        }

        return response.data;
      } catch (error: any) {
        const isLastAttempt = attempt === retries - 1;
        const statusCode = error.response?.status;
        const modelId = url.replace('/', ''); // Extract model ID from URL

        // Detailed logging for failed model calls
        this.logger.error('HF API request failed', {
          modelId,
          url,
          method,
          statusCode,
          attempt: attempt + 1,
          maxRetries: retries,
          errorMessage: error.message,
          errorData: error.response?.data
        });

        // DO NOT RETRY on 404 errors (model doesn't exist or no inference endpoint)
        if (statusCode === 404) {
          this.logger.error('Model not found or no inference endpoint available - skipping retries', {
            modelId,
            statusCode: 404,
            message: 'This model may not exist or may not have a public inference endpoint'
          });

          // Cache the negative result
          this.modelAvailabilityCache.set(modelId, {
            available: false,
            checkedAt: Date.now()
          });

          throw new Error(`Model ${modelId} not found or unavailable (404). Please verify the model ID and ensure it has a public inference endpoint.`);
        }

        // DO NOT RETRY on 403 errors (authentication/permission issues)
        if (statusCode === 403) {
          this.logger.error('Access denied to model - skipping retries', {
            modelId,
            statusCode: 403,
            message: 'This model may require authentication or is private'
          });
          throw new Error(`Access denied to model ${modelId} (403). This model may be private or require authentication.`);
        }

        // Handle model loading (503)
        if (statusCode === 503) {
          const errorData = error.response.data;
          if (errorData?.error?.includes('loading')) {
            const estimatedTime = errorData.estimated_time || 10;
            this.logger.info(`Model loading, waiting ${estimatedTime}s (attempt ${attempt + 1}/${retries})`, {
              modelId,
              estimatedTime
            });
            await new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));
            continue;
          }
        }

        if (isLastAttempt) {
          this.logger.error('All HF API retry attempts exhausted', {
            modelId,
            url,
            method,
            attempts: retries,
            finalStatus: statusCode
          }, error);
          throw error;
        }

        // Exponential backoff for retryable errors
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.debug(`Retrying after ${delay}ms`, { attempt: attempt + 1, maxRetries: retries });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('All retry attempts failed');
  }

  /**
   * Make inference request to a model
   * Validates model availability before making the request
   */
  protected async inference<T>(modelId: string, inputs: any, validateFirst: boolean = false): Promise<T> {
    // Optional pre-validation (can be enabled to reduce failed requests)
    if (validateFirst) {
      const isAvailable = await this.validateModelAvailability(modelId);
      if (!isAvailable) {
        throw new Error(`Model ${modelId} is not available or does not have a public inference endpoint`);
      }
    }

    const url = `/${modelId}`;
    return this.makeRequest<T>(url, 'POST', { inputs });
  }

  /**
   * Get dataset info from Hugging Face
   */
  protected async getDatasetInfo(datasetId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.HF_API_BASE}/datasets/${datasetId}`, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      this.logger.warn('Failed to fetch dataset info', { datasetId }, error as Error);
      return null;
    }
  }
}

