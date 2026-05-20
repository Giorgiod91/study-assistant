
# Creating method and more to track the progress and to calc progress and to define which
# areas and more a givin progress points 

# progress
progress = 100

# get Progress

def getProgress():
   return progress


# handle value of progress

def progressValue():
    done_task = 40
    done_part_of_task = 10
    set_date_for_task =5

    return done_task, done_part_of_task


# add value to progress

def addValue(value):
    if progress - value < 100:
        progress += value

        return progress


