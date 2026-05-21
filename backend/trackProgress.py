
# Creating method and more to track the progress and to calc progress and to define which
# areas and more a givin progress points 

# progress
progress = 100

# get Progress

def getProgress():
   return progress


# handle value of progress

def progressValue():
    # array with all the values
    value = [
            ["done_task",40],
            ["done_part_of_task",10],
            ["set_date_for_task",5],
            ]

   
    return value


# add value to progress

def addValue(value, progress):
    # first get the actual values
    actual_values = progressValue()

    # check if the value is valid
    valid_points = [item[1] for item in actual_values]
    for i in actual_values:
        if value == i:
            value = i
    if progress - value < 100:
        progress += value

        return progress




