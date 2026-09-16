import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateJobStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['running', 'completed', 'failed'])
  status: string;
}
