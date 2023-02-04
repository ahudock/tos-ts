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

# Max number of bars between large candles that constitute a reversal
input reversal_length = 3;

# Average length for determining large candles
input avg_length = 20;

# Minimum percentage ATR for large candles
input factor = 0.8;

def candle_range    = high - low;
def bull_candle     = open < close;
def large_body      = BodyHeight() >= (candle_range * .5);
def avg_candle      = Average(candle_range, avg_length) * factor;
def large_candle;
def reversal;

if (large_body is true and candle_range >= avg_candle) {
    large_candle = 1;

    reversal = fold i = 1 to reversal_length + 1 with found do
        if large_candle[i] is true
            and bull_candle is true
            and bull_candle[i] is false
            and close > high[i]
                # Large bullish reversal
                then i
        else if large_candle[i] is true
            and bull_candle is false
            and bull_candle[i] is true
            and close < low[i]
                # Large bearish reversal
                then i
        else 0;
} else {
    large_candle = 0;
    reversal = 0;
}

plot supply_zone = if reversal > 0 and bull_candle is false then high else Double.NaN;
supply_zone.SetDefaultColor(Color.CYAN);
supply_zone.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);

plot demand_zone = if reversal > 0 and bull_candle is true then low else Double.NaN;
demand_zone.SetDefaultColor(Color.CYAN);
demand_zone.SetPaintingStrategy(PaintingStrategy.ARROW_UP);

AssignPriceColor(
    if bull_candle is true and large_candle is true then
        Color.GREEN
    else if bull_candle is true and large_candle is false then
        Color.DARK_GREEN
    else if bull_candle is false and large_candle is true then
        Color.RED
    else
        Color.DARK_RED
);

