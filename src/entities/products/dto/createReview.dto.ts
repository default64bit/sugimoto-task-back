import { IsNotEmpty, IsNumberString, IsString, Length, Max, Min } from "class-validator";

export class CreateReviewDTO {
  @Length(1, 200)
  @IsString()
  @IsNotEmpty()
  readonly usersName: string;

  @Length(0, 1000)
  @IsString()
  readonly text: string;

  @Min(1)
  @Max(5)
  @IsNumberString()
  readonly rating: number;
}
