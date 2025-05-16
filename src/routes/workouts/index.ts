import { factory } from '@/lib/create-app';
import { CreateWorkout } from '@/routes/workouts/create-workout';
import { BulkCreateExercises, CreateExercise, GetExercises } from '@/routes/workouts/excercices';

const workoutsRouter = factory
  .createApp()
  .post('/workout', ...CreateWorkout)
  .post('/exercise', ...CreateExercise)
  .post('/exercises/bulk', ...BulkCreateExercises)
  .get('/exercises', ...GetExercises);

export default workoutsRouter;
