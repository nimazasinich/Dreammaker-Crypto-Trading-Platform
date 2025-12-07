import os
import logging
import requests
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import ta
from textblob import TextBlob
from cachetools import TTLCache
import telebot
import yfinance as yf
import streamlit_option_menu as som
from PIL import Image
import ccxt

# Base settings
CACHE_DIR = "cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crypto_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API keys and tokens
TELEGRAM_TOKEN = '7437859619:AAGeGG3ZkLM0OVaw-Exx1uMRE55JtBCZZCY'
TELEGRAM_CHAT_ID = '-1002228627548'
COINMARKETCAP_API_KEY = '04cf4b5b-9868-465c-8ba0-9f2e78c92eb1'
NEWS_API_KEY = '968a5e25552b4cb5ba3280361d8444ab'
SANTIMENT_API_KEY = 'vltdvdho63uqnjgf_fq75qbks72e3wfmx'

# Initialize Telegram bot
bot = telebot.TeleBot(TELEGRAM_TOKEN)

# Initialize exchange
exchange = ccxt.binance({
    'enableRateLimit': True,
    'options': {
        'defaultType': 'future'
    }
})

class CacheManager:
    """Advanced cache management with TTL"""
    def __init__(self, cache_dir: str = CACHE_DIR, ttl: int = 300):
        self.cache_dir = cache_dir
        self.ttl = ttl
        self.memory_cache = TTLCache(maxsize=100, ttl=ttl)

    def get_cache_path(self, key: str) -> str:
        return os.path.join(self.cache_dir, f"{key}.json")

    def is_valid(self, key: str) -> bool:
        if key in self.memory_cache:
            return True
        path = self.get_cache_path(key)
        if not os.path.exists(path):
            return False
        return (time.time() - os.path.getmtime(path)) < self.ttl

    def get(self, key: str) -> Optional[Dict]:
        if key in self.memory_cache:
            return self.memory_cache[key]
        if not self.is_valid(key):
            return None
        try:
            with open(self.get_cache_path(key), 'r') as f:
                data = json.load(f)
                self.memory_cache[key] = data
                return data
        except Exception as e:
            logger.error(f"Cache read error: {e}")
            return None

    def set(self, key: str, data: Dict) -> None:
        try:
            self.memory_cache[key] = data
            with open(self.get_cache_path(key), 'w') as f:
                json.dump(data, f)
        except Exception as e:
            logger.error(f"Cache write error: {e}")

class MarketData:
    """Handle market data operations"""
    def __init__(self):
        self.cache = CacheManager()
        self.exchange = exchange

    def get_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 500) -> pd.DataFrame:
        """Get OHLCV data from exchange"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('timestamp', inplace=True)
            return df
        except Exception as e:
            logger.error(f"Error fetching OHLCV data: {e}")
            return pd.DataFrame()

    def get_ticker(self, symbol: str) -> Dict:
        """Get current ticker information"""
        try:
            return self.exchange.fetch_ticker(symbol)
        except Exception as e:
            logger.error(f"Error fetching ticker: {e}")
            return {}

class TechnicalAnalysis:
    """Technical analysis computations"""
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.calculate_indicators()

    def calculate_indicators(self):
        # Trend Indicators
        self.df['sma20'] = ta.trend.sma_indicator(self.df['close'], window=20)
        self.df['sma50'] = ta.trend.sma_indicator(self.df['close'], window=50)
        self.df['sma200'] = ta.trend.sma_indicator(self.df['close'], window=200)
        
        # Momentum Indicators
        self.df['rsi'] = ta.momentum.rsi(self.df['close'])
        self.df['macd'] = ta.trend.macd_diff(self.df['close'])
        self.df['stoch_k'] = ta.momentum.stoch(self.df['high'], self.df['low'], self.df['close'])
        self.df['stoch_d'] = ta.momentum.stoch_signal(self.df['high'], self.df['low'], self.df['close'])
        
        # Volatility Indicators
        bb = ta.volatility.BollingerBands(self.df['close'])
        self.df['bb_upper'] = bb.bollinger_hband()
        self.df['bb_middle'] = bb.bollinger_mavg()
        self.df['bb_lower'] = bb.bollinger_lband()
        self.df['atr'] = ta.volatility.average_true_range(self.df['high'], self.df['low'], self.df['close'])
        
        # Volume Indicators
        self.df['volume_sma'] = ta.volume.volume_weighted_average_price(self.df['high'], 
                                                                      self.df['low'], 
                                                                      self.df['close'], 
                                                                      self.df['volume'])

    def get_signals(self) -> Dict[str, List[str]]:
        current = self.df.iloc[-1]
        prev = self.df.iloc[-2]
        
        signals = {
            'buy': [],
            'sell': [],
            'neutral': []
        }
        
        # RSI Signals
        if current['rsi'] < 30:
            signals['buy'].append('RSI oversold')
        elif current['rsi'] > 70:
            signals['sell'].append('RSI overbought')
        
        # MACD Signals
        if current['macd'] > 0 and prev['macd'] <= 0:
            signals['buy'].append('MACD crossed above zero')
        elif current['macd'] < 0 and prev['macd'] >= 0:
            signals['sell'].append('MACD crossed below zero')
            
        # Bollinger Bands Signals
        if current['close'] < current['bb_lower']:
            signals['buy'].append('Price below lower Bollinger Band')
        elif current['close'] > current['bb_upper']:
            signals['sell'].append('Price above upper Bollinger Band')
            
        # Moving Average Signals
        if current['sma20'] > current['sma50'] and prev['sma20'] <= prev['sma50']:
            signals['buy'].append('SMA 20 crossed above SMA 50')
        elif current['sma20'] < current['sma50'] and prev['sma20'] >= prev['sma50']:
            signals['sell'].append('SMA 20 crossed below SMA 50')
            
        return signals

class DashboardUI:
    """Streamlit dashboard interface"""
    def __init__(self):
        self.market_data = MarketData()
        self.setup_page()
        
    def setup_page(self):
        st.set_page_config(
            page_title="Crypto Trading Dashboard",
            page_icon="📊",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        
        # Custom CSS
        st.markdown("""
            <style>
            .stApp {
                background-color: #0e1117;
                color: #ffffff;
            }
            .stButton>button {
                background-color: #1f77b4;
                color: white;
            }
            .stSelectbox>div>div {
                background-color: #262730;
            }
            </style>
            """, unsafe_allow_html=True)

    def sidebar(self):
        with st.sidebar:
            selected = som.option_menu(
                "Navigation",
                ["Dashboard", "Technical Analysis", "Market Analysis", "Settings"],
                icons=['house', 'graph-up', 'currency-exchange', 'gear'],
                menu_icon="cast",
                default_index=0,
            )
            
            symbol = st.text_input("Trading Pair", value="BTC/USDT")
            timeframe = st.selectbox(
                "Timeframe",
                options=['1m', '5m', '15m', '1h', '4h', '1d']
            )
            
            return selected, symbol, timeframe

    def create_price_chart(self, df: pd.DataFrame, symbol: str):
        fig = make_subplots(
            rows=3, cols=1,
            shared_xaxes=True,
            vertical_spacing=0.03,
            row_heights=[0.6, 0.2, 0.2]
        )

        # Candlestick chart
        fig.add_trace(
            go.Candlestick(
                x=df.index,
                open=df['open'],
                high=df['high'],
                low=df['low'],
                close=df['close'],
                name="OHLC"
            ),
            row=1, col=1
        )

        # Add moving averages
        fig.add_trace(
            go.Scatter(
                x=df.index,
                y=df['sma20'],
                name="SMA 20",
                line=dict(color='yellow', width=1)
            ),
            row=1, col=1
        )

        fig.add_trace(
            go.Scatter(
                x=df.index,
                y=df['sma50'],
                name="SMA 50",
                line=dict(color='blue', width=1)
            ),
            row=1, col=1
        )

        # Volume bars
        colors = ['red' if row['open'] > row['close'] else 'green' for index, row in df.iterrows()]
        fig.add_trace(
            go.Bar(
                x=df.index,
                y=df['volume'],
                name="Volume",
                marker_color=colors
            ),
            row=2, col=1
        )

        # RSI
        fig.add_trace(
            go.Scatter(
                x=df.index,
                y=df['rsi'],
                name="RSI",
                line=dict(color='purple', width=1)
            ),
            row=3, col=1
        )

        # Add RSI levels
        fig.add_hline(y=70, line_dash="dash", line_color="red", row=3, col=1)
        fig.add_hline(y=30, line_dash="dash", line_color="green", row=3, col=1)

        # Update layout
        fig.update_layout(
            title=f"{symbol} Price Chart",
            yaxis_title="Price",
            yaxis2_title="Volume",
            yaxis3_title="RSI",
            xaxis_rangeslider_visible=False,
            height=800,
            template='plotly_dark'
        )

        st.plotly_chart(fig, use_container_width=True)

    def show_dashboard(self, symbol: str, timeframe: str):
        col1, col2, col3 = st.columns(3)
        
        # Get current market data
        ticker = self.market_data.get_ticker(symbol)
        
        with col1:
            st.metric(
                "Price",
                f"${ticker.get('last', 0):,.2f}",
                f"{ticker.get('percentage', 0):.2f}%"
            )
            
        with col2:
            st.metric(
                "24h Volume",
                f"${ticker.get('quoteVolume', 0):,.0f}"
            )
            
        with col3:
            st.metric(
                "24h Change",
                f"${ticker.get('change', 0):,.2f}"
            )
            
        # Get historical data and calculate indicators
        df = self.market_data.get_ohlcv(symbol, timeframe)
        if not df.empty:
            analysis = TechnicalAnalysis(df)
            self.create_price_chart(analysis.df, symbol)
            
            # Show signals
            signals = analysis.get_signals()
            cols = st.columns(3)
            
            with cols[0]:
                st.subheader("Buy Signals")
                for signal in signals['buy']:
                    st.success(signal)
                    
            with cols[1]:
                st.subheader("Sell Signals")
                for signal in signals['sell']:
                    st.error(signal)
                    
            with cols[2]:
                st.subheader("Neutral Signals")
                for signal in signals['neutral']:
                    st.info(signal)
                    
            # Show technical indicators
            st.subheader("Technical Indicators")
            ind_cols = st.columns(4)
            
            with ind_cols[0]:
                st.metric("RSI", f"{analysis.df['rsi'].iloc[-1]:.2f}")
                
            with ind_cols[1]:
                st.metric("MACD", f"{analysis.df['macd'].iloc[-1]:.2f}")
                
            with ind_cols[2]:
                st.metric("ATR", f"{analysis.df['atr'].iloc[-1]:.2f}")
                
            with ind_cols[3]:
                volume_change = ((analysis.df['volume'].iloc[-1] / analysis.df['volume'].iloc[-2]) - 1) * 100
                st.metric("Volume Change", f"{volume_change:.2f}%")

def main():
    """Main application entry point"""
    try:
        dashboard = DashboardUI()
        selected, symbol, timeframe = dashboard.sidebar()
        
        if selected == "Dashboard":
            st.title("📊 Crypto Trading Dashboard")
            dashboard.show_dashboard(symbol, timeframe)
        
        elif selected == "Technical Analysis":
            st.title("📈 Technical Analysis")
            
            df = dashboard.market_data.get_ohlcv(symbol, timeframe)
            if not df.empty:
                analysis = TechnicalAnalysis(df)
                
                # Advanced Technical Analysis Section
                st.subheader("Advanced Technical Analysis")
                
                # Support and Resistance Levels
                st.markdown("### Support and Resistance Levels")
                levels_col1, levels_col2 = st.columns(2)
                
                with levels_col1:
                    pivot_point = (df['high'].iloc[-1] + df['low'].iloc[-1] + df['close'].iloc[-1]) / 3
                    r1 = 2 * pivot_point - df['low'].iloc[-1]
                    r2 = pivot_point + (df['high'].iloc[-1] - df['low'].iloc[-1])
                    st.metric("Resistance 2", f"${r2:.2f}")
                    st.metric("Resistance 1", f"${r1:.2f}")
                    
                with levels_col2:
                    s1 = 2 * pivot_point - df['high'].iloc[-1]
                    s2 = pivot_point - (df['high'].iloc[-1] - df['low'].iloc[-1])
                    st.metric("Support 1", f"${s1:.2f}")
                    st.metric("Support 2", f"${s2:.2f}")
                
                # Trend Analysis
                st.markdown("### Trend Analysis")
                trend_cols = st.columns(3)
                
                with trend_cols[0]:
                    # Short-term trend (20 SMA)
                    short_trend = "Bullish" if df['close'].iloc[-1] > df['sma20'].iloc[-1] else "Bearish"
                    st.metric("Short-term Trend", short_trend)
                    
                with trend_cols[1]:
                    # Medium-term trend (50 SMA)
                    medium_trend = "Bullish" if df['close'].iloc[-1] > df['sma50'].iloc[-1] else "Bearish"
                    st.metric("Medium-term Trend", medium_trend)
                    
                with trend_cols[2]:
                    # Long-term trend (200 SMA)
                    long_trend = "Bullish" if df['close'].iloc[-1] > df['sma200'].iloc[-1] else "Bearish"
                    st.metric("Long-term Trend", long_trend)
                
                # Momentum Analysis
                st.markdown("### Momentum Analysis")
                momentum_cols = st.columns(4)
                
                with momentum_cols[0]:
                    rsi_status = "Overbought" if analysis.df['rsi'].iloc[-1] > 70 else "Oversold" if analysis.df['rsi'].iloc[-1] < 30 else "Neutral"
                    st.metric("RSI Status", rsi_status, analysis.df['rsi'].iloc[-1])
                    
                with momentum_cols[1]:
                    macd_status = "Bullish" if analysis.df['macd'].iloc[-1] > 0 else "Bearish"
                    st.metric("MACD Status", macd_status, analysis.df['macd'].iloc[-1])
                    
                with momentum_cols[2]:
                    stoch_status = "Overbought" if analysis.df['stoch_k'].iloc[-1] > 80 else "Oversold" if analysis.df['stoch_k'].iloc[-1] < 20 else "Neutral"
                    st.metric("Stochastic Status", stoch_status, analysis.df['stoch_k'].iloc[-1])
                    
                with momentum_cols[3]:
                    bb_position = "Upper" if df['close'].iloc[-1] > analysis.df['bb_upper'].iloc[-1] else "Lower" if df['close'].iloc[-1] < analysis.df['bb_lower'].iloc[-1] else "Middle"
                    st.metric("BB Position", bb_position)
                
                # Volume Analysis
                st.markdown("### Volume Analysis")
                volume_cols = st.columns(3)
                
                with volume_cols[0]:
                    avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
                    volume_ratio = df['volume'].iloc[-1] / avg_volume
                    volume_status = "Above Average" if volume_ratio > 1 else "Below Average"
                    st.metric("Volume Status", volume_status, f"{(volume_ratio-1)*100:.1f}%")
                    
                with volume_cols[1]:
                    volume_trend = "Increasing" if df['volume'].iloc[-1] > df['volume'].iloc[-2] else "Decreasing"
                    volume_change = ((df['volume'].iloc[-1] / df['volume'].iloc[-2]) - 1) * 100
                    st.metric("Volume Trend", volume_trend, f"{volume_change:.1f}%")
                    
                with volume_cols[2]:
                    vwap = analysis.df['volume_sma'].iloc[-1]
                    vwap_diff = ((df['close'].iloc[-1] / vwap) - 1) * 100
                    st.metric("VWAP Difference", f"${vwap:.2f}", f"{vwap_diff:.1f}%")
                
                # Trading Signals Summary
                st.markdown("### Trading Signals Summary")
                signals = analysis.get_signals()
                
                signal_cols = st.columns(3)
                with signal_cols[0]:
                    st.markdown("#### 🟢 Buy Signals")
                    for signal in signals['buy']:
                        st.success(signal)
                        
                with signal_cols[1]:
                    st.markdown("#### 🔴 Sell Signals")
                    for signal in signals['sell']:
                        st.error(signal)
                        
                with signal_cols[2]:
                    st.markdown("#### ⚪ Neutral Signals")
                    for signal in signals['neutral']:
                        st.info(signal)
                
        elif selected == "Market Analysis":
            st.title("💹 Market Analysis")
            
            # Market Overview
            st.subheader("Market Overview")
            ticker = dashboard.market_data.get_ticker(symbol)
            
            market_cols = st.columns(4)
            with market_cols[0]:
                st.metric("24h High", f"${ticker.get('high', 0):,.2f}")
            with market_cols[1]:
                st.metric("24h Low", f"${ticker.get('low', 0):,.2f}")
            with market_cols[2]:
                st.metric("24h Volume", f"${ticker.get('quoteVolume', 0):,.0f}")
            with market_cols[3]:
                st.metric("Price Change", f"{ticker.get('percentage', 0):.2f}%")
            
            # Market Depth
            st.subheader("Market Depth")
            try:
                order_book = exchange.fetch_order_book(symbol)
                
                depth_cols = st.columns(2)
                with depth_cols[0]:
                    st.markdown("#### Bids")
                    bid_df = pd.DataFrame(order_book['bids'], columns=['Price', 'Amount'])
                    bid_df = bid_df.head(10)
                    st.dataframe(bid_df)
                    
                with depth_cols[1]:
                    st.markdown("#### Asks")
                    ask_df = pd.DataFrame(order_book['asks'], columns=['Price', 'Amount'])
                    ask_df = ask_df.head(10)
                    st.dataframe(ask_df)
            except Exception as e:
                st.error(f"Error fetching order book: {e}")
            
        elif selected == "Settings":
            st.title("⚙️ Settings")
            
            # Alert Settings
            st.subheader("Alert Settings")
            
            alert_cols = st.columns(2)
            with alert_cols[0]:
                enable_alerts = st.checkbox("Enable Telegram Alerts", value=True)
                alert_timeframe = st.selectbox(
                    "Alert Timeframe",
                    options=['1m', '5m', '15m', '1h', '4h', '1d'],
                    index=2
                )
            
            with alert_cols[1]:
                rsi_threshold = st.slider("RSI Alert Threshold", 0, 100, (30, 70))
                price_change_threshold = st.slider("Price Change Alert Threshold (%)", 0.0, 10.0, 5.0)
            
            # Trading Settings
            st.subheader("Trading Settings")
            
            trade_cols = st.columns(2)
            with trade_cols[0]:
                risk_percentage = st.slider("Risk per Trade (%)", 0.1, 5.0, 1.0)
                leverage = st.slider("Leverage", 1, 20, 1)
            
            with trade_cols[1]:
                stop_loss_percentage = st.slider("Stop Loss (%)", 0.1, 10.0, 2.0)
                take_profit_percentage = st.slider("Take Profit (%)", 0.1, 20.0, 4.0)
            
            # Save Settings
            if st.button("Save Settings"):
                st.success("Settings saved successfully!")

    except Exception as e:
        st.error(f"An error occurred: {e}")
        logger.error(f"Application error: {e}")

if __name__ == "__main__":
    main()