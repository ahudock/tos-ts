#
# Supply and Demand Areas
#
# Andy Hudock <ahudock@pm.me>
#
# Based on Blake Young's large candle indicator, which highlights candles
# having body-height the same or larger than 80% ATR (by default) and
# bodies larger than half of the entire range, supply and demand areas
# appear where buyers have taken control from sellers (or vice versa).
#

# Number of previous bars to search for large reversal candles
input lookback_window = 3;

# Average length for determining large candles
input avg_length = 20;

# Minimum percentage ATR for large candles
input atr_factor = 0.8;

def candle_range    = high - low;
def bull_candle     = open < close;
def is_large_body   = BodyHeight() >= (candle_range * .5);
def avg_candle_size = Average(candle_range, avg_length) * atr_factor;
def larger_than_avg = candle_range >= avg_candle_size;
def is_large;
def confirming_candle;

# Highlight large candles
AssignPriceColor(
    if bull_candle == 1 and is_large == 1 then
        Color.GREEN
    else if bull_candle == 1 and is_large == 0 then
        Color.DARK_GREEN
    else if bull_candle == 0 and is_large == 1 then
        Color.RED
    else
        Color.DARK_RED
);

# Find large reversal candles
if (is_large_body == 1 and larger_than_avg == 1) {
    is_large = 1;

    confirming_candle = fold i = 1 to lookback_window + 1
        with found
        while found == 0 do
            if is_large[i] == 1
                and bull_candle == 1
                and bull_candle[i] == 0
                and close > high[i]
                    # Large bullish reversal
                    then found + i
            else if is_large[i] == 1
                and bull_candle == 0
                and bull_candle[i] == 1
                and close < low[i]
                    # Large bearish reversal
                    then found + i
            else 0;
} else {
    is_large = 0;
    confirming_candle = Double.NaN;
}

plot bullish_reversal = if confirming_candle > 0 and bull_candle == 1 then low else Double.NaN;
bullish_reversal.SetDefaultColor(Color.CYAN);
bullish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);

plot bearish_reversal = if confirming_candle > 0 and bull_candle == 0 then high else Double.NaN;
bearish_reversal.SetDefaultColor(Color.CYAN);
bearish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);

