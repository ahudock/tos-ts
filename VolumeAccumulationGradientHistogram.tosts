#
# Volume Accumulation Gradient Histogram
#
# The Volume Accumulation study calculates
# volume multiplied by the difference between
# the close price and the midpoint of the bar's range.
#
# TD Ameritrade IP Company, Inc. (c) 2007-2022
#
# @history:
#    2023-01-26: Andy Hudock <ahudock@pm.me>: Paint as
#        squared histogram and assign normalized gradient color
#

declare lower;

input colorNormLength = 10;

plot VA = ((close - (high + low) / 2) * volume);
VA.SetPaintingStrategy(PaintingStrategy.SQUARED_HISTOGRAM);
VA.AssignNormGradientColor(colorNormLength, Color.MAGENTA, Color.CYAN);
