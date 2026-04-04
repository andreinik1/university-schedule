export interface ILesson {
  name: string;
  teacher: string;
  room?: string;
}

export type LessonSlot = {
  numerator: ILesson | null;
  denominator: ILesson | null;
} | null;

export type DaySchedule = LessonSlot[];
export type GroupsData = Record<string, Record<string, DaySchedule>>;