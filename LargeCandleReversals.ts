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

# Number of bars to search for large reversal candles
input prefetch = 3;

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
def reversal_candle;
def is_bullish_reversal;
def is_bearish_reversal;
def next_reversal;
def is_confirmation;

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
if (1 == is_large_body and 1 == larger_than_avg) {
    is_large = 1;

    next_reversal = fold i = 1 to prefetch + 1
        with is_reversal
        while 0 == is_reversal do
            if 1 == GetValue(is_large, -i)
                and 0 == bull_candle
                and 1 == GetValue(bull_candle, -i)
                and GetValue(close, -i) > high
                    then BarNumber() + i # Bullish reversal
            else if 1 == GetValue(is_large, -i)
                and 1 == bull_candle
                and 0 == GetValue(bull_candle, -i)
                and GetValue(close, -i) < low
                    then BarNumber() + i # Bearish reversal
            else 0;

    if (0 < next_reversal) {
        is_confirmation = 1;
        confirming_candle = BarNumber();
        reversal_candle = next_reversal;
    } else {
        is_confirmation = 0;
        confirming_candle = confirming_candle[1];
        reversal_candle = reversal_candle[1];
    }
} else {
    is_large = 0;
    next_reversal = Double.NaN;
    is_confirmation = 0;
    confirming_candle = confirming_candle[1];
    reversal_candle = reversal_candle[1];
}

# Reversal indicators
if (1 == is_confirmation) {
    is_bullish_reversal =
        if 1 == GetValue(bull_candle, BarNumber() - next_reversal) then 1
        else 0;
    is_bearish_reversal =
        if 0 == GetValue(bull_candle, BarNumber() - next_reversal) then 1
        else 0;
} else {
    is_bullish_reversal = 0;
    is_bearish_reversal = 0;
}

plot bullish_reversal = if BarNumber() == reversal_candle and 1 == bull_candle then low else Double.NaN;
bullish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
bullish_reversal.SetDefaultColor(Color.CYAN);
#bullish_reversal.Hide();

plot bearish_reversal = if BarNumber() == reversal_candle and 0 == bull_candle then high else Double.NaN;
bearish_reversal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
bearish_reversal.SetDefaultColor(Color.MAGENTA);
#bearish_reversal.Hide();

# Supply and demand zones

def confirming_candle_value;
def reversal_candle_value;

if (1 == is_bullish_reversal) {
    confirming_candle_value = open;
    #reversal_candle_value = GetValue(low, BarNumber() - reversal_candle);
} else if (1 == is_bearish_reversal) {
    confirming_candle_value = open;
    #reversal_candle_value = GetValue(high, BarNumber() - reversal_candle);
} else {
    confirming_candle_value = confirming_candle_value[1];
    #reversal_candle_value = reversal_candle_value[1];
}

if (reversal_candle == BarNumber()) {
    if (1 == bull_candle) {
        reversal_candle_value = GetValue(low, BarNumber() - reversal_candle);
    } else {
        reversal_candle_value = GetValue(high, BarNumber() - reversal_candle);
    }
} else {
    reversal_candle_value = reversal_candle_value[1];
}

AddLabel(yes, "Confirming Candle: " + confirming_candle);
AddLabel(yes, "Next Reversal: " + next_reversal);
AddLabel(yes, "Reversal Candle: " + reversal_candle);
AddLabel(yes, "Reversal Candle Value: " + reversal_candle_value);

plot reversal_zone_1 = confirming_candle_value;
reversal_zone_1.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
reversal_zone_1.SetDefaultColor(Color.CYAN);
reversal_zone_1.Hide();

plot reversal_zone_2 = reversal_candle_value;
reversal_zone_2.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
reversal_zone_2.SetDefaultColor(Color.MAGENTA);
reversal_zone_2.Hide();

AddCloud(reversal_zone_1, reversal_zone_2, Color.CYAN, Color.MAGENTA, 0);
