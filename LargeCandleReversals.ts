#
# Large Candle Reversals
#
# Andy Hudock <ahudock@pm.me>
#
# Based on Blake Young's large candle indicator, which highlights candles
# having body-height the same or larger than 80% ATR (by default) and
# bodies larger than half of the entire range, supply and demand areas
# appear where buyers have taken control from sellers (and vice versa).
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
def confirmation;
def confirming_candle;
def is_reversal_candle;
def reversal_candle;
def is_bullish_reversal;
def is_bearish_reversal;

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

    confirmation = fold i = 1 to lookback_window + 1
        with found
        while found == 0 do
            if is_large[i] == 1
                and bull_candle == 1
                and bull_candle[i] == 0
                and close > high[i]
                    then BarNumber() - i # Bullish reversal confirmation candle
            else if is_large[i] == 1
                and bull_candle == 0
                and bull_candle[i] == 1
                and close < low[i]
                    then BarNumber() - i # Bearish reversal confirmation candle
            else 0;
    
    confirming_candle = confirmation;
} else {
    is_large = 0;
    confirmation = Double.NaN;
    confirming_candle = confirming_candle[1];
}

if (1 == BarNumber()) {
    is_reversal_candle = 0;
    reversal_candle = 0;
} else {
    if (1 == is_large
        and 0 < confirming_candle
        and confirming_candle >= reversal_candle[1]
    ) {
        # Large-candle Reversal
        is_reversal_candle = 1;
        reversal_candle = BarNumber();
    } else {
        is_reversal_candle = 0;
        reversal_candle = reversal_candle[1];
    }
}

# Reversal indicators
is_bullish_reversal = if 0 < is_reversal_candle and 1 == bull_candle then 1 else 0;
is_bearish_reversal = if 0 < is_reversal_candle and 0 == bull_candle then 1 else 0;

#plot bullish_reversal = if 0 < is_reversal_candle and 1 == bull_candle then low else Double.NaN;
bullish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
bullish_reversal.SetDefaultColor(Color.UPTICK);

#plot bearish_reversal = if 0 < is_reversal_candle and 0 == bull_candle then high else Double.NaN;
bearish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
bearish_reversal.SetDefaultColor(Color.DOWNTICK);

#AddLabel(yes, "Is Reversal Candle: " + is_reversal_candle);
#AddLabel(yes, "Confirming Candle: " + confirming_candle);
#AddLabel(yes, "Confirming Candle Close: " + GetValue(close, BarNumber() - confirming_candle));
#AddLabel(yes, "Reversal Candle: " + reversal_candle);
#AddLabel(yes, "Reversal Candle Open: " + GetValue(open, BarNumber() - reversal_candle));
#AddLabel(yes, "Reversal Candle Close: " + GetValue(close, BarNumber() - reversal_candle));

# Supply and demand zones
def confirming_candle_value;
def reversal_candle_value;

if (1 == is_bullish_reversal) {
    confirming_candle_value = GetValue(open, BarNumber() - confirming_candle);
    reversal_candle_value = GetValue(low, BarNumber() - reversal_candle);
} else if (1 == is_bearish_reversal) {
    confirming_candle_value = GetValue(open, BarNumber() - confirming_candle);
    reversal_candle_value = GetValue(high, BarNumber() - reversal_candle);
} else {
    confirming_candle_value = confirming_candle_value[1];
    reversal_candle_value = reversal_candle_value[1];
}

plot reversal_zone_1 = confirming_candle_value[-1];
#reversal_zone_1.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
reversal_zone_1.SetDefaultColor(Color.CYAN);

plot reversal_zone_2 = reversal_candle_value[-1];
#reversal_zone_2.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
reversal_zone_2.SetDefaultColor(Color.MAGENTA);

AddCloud(reversal_zone_1, reversal_zone_2, Color.CYAN, Color.MAGENTA, no);

