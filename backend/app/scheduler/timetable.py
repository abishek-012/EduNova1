import random
from collections import defaultdict

# --------------------------------------------------
# DAY-LEVEL SCHEDULER
# --------------------------------------------------
def generate_day_timetable(teachers, classes, subjects, subject_teacher, periods, teacher_weekly_load):
    timetable = [{} for _ in range(periods)]

    teacher_streak = {t: 0 for t in teachers}
    double_streak_used = False
    double_streak_teacher = None

    for p in range(periods):
        used_teachers = set()
        random.shuffle(classes)

        for cls in classes:
            assigned = False
            random.shuffle(subjects)

            for subject in subjects:
                t = subject_teacher[subject]

                if t in used_teachers:
                    continue

                if teacher_streak[t] >= 2:
                    continue

                if (
                    teacher_streak[t] == 1
                    and double_streak_used
                    and t != double_streak_teacher
                ):
                    continue

                timetable[p][cls] = (subject, t)
                used_teachers.add(t)

                teacher_streak[t] += 1
                teacher_weekly_load[t] += 1

                if teacher_streak[t] == 2:
                    double_streak_used = True
                    double_streak_teacher = t

                assigned = True
                break

            if not assigned:
                timetable[p][cls] = ("FREE", "FREE")

        for t in teachers:
            if t not in used_teachers:
                teacher_streak[t] = 0

    return timetable, teacher_weekly_load


# --------------------------------------------------
# WEEKLY SCHEDULER
# --------------------------------------------------
def generate_weekly_timetable(num_classes, days, periods_per_day, subjects, subject_teacher):
    teachers = list(set(subject_teacher.values()))
    classes = [f"C{i+1}" for i in range(num_classes)]

    weekly_timetable = {}
    teacher_weekly_load = defaultdict(int)

    for day in days:
        day_table, teacher_weekly_load = generate_day_timetable(
            teachers,
            classes,
            subjects,
            subject_teacher,
            periods_per_day,
            teacher_weekly_load
        )
        weekly_timetable[day] = day_table

    return weekly_timetable, classes


# --------------------------------------------------
# MAIN (USER INPUT)
# --------------------------------------------------
if __name__ == "__main__":
    num_classes = int(input("Enter number of classes: "))
    periods_per_day = int(input("Enter periods per day: "))

    include_saturday = input("Include Saturday? (yes/no): ").lower() == "yes"

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if include_saturday:
        days.append("Saturday")

    num_subjects = int(input("\nEnter number of subjects: "))

    subjects = []
    subject_teacher = {}

    print("\nEnter subject name and teacher name:")
    for i in range(num_subjects):
        subject = input(f"Subject {i+1} name: ")
        teacher = input(f"Teacher for {subject}: ")
        subjects.append(subject)
        subject_teacher[subject] = teacher

    weekly_tt, classes = generate_weekly_timetable(
        num_classes,
        days,
        periods_per_day,
        subjects,
        subject_teacher
    )