#
# Blake Young's Large Candle indicator
#

input length = 20;
input factor = 0.8;

def candle_range = high - low;
def bull_candle = open < close;
def large_body = BodyHeight() >= (candle_range * .5);

def avg_candle = Average(candle_range, length) * factor;
def larger_candle = candle_range >= avg_candle;

AssignPriceColor(if bull_candle is true and large_body is true and larger_candle is true then
    Color.GREEN else if bull_candle is true and (large_body is false or larger_candle is false) then
    Color.DARK_GREEN else if bull_candle is false and large_body is true and larger_candle is true then
    Color.RED else Color.DARK_RED);