import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  rating: number;

  @IsNumber()
  @IsNotEmpty()
  animeId: number;
}