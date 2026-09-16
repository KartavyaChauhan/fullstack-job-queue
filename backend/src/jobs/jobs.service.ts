import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: createJobDto.title,
        type: createJobDto.type,
        status: 'pending',
      },
    });
  }

  findAll() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, newStatus: string) {
    // Determine required previous state based on the transition rules:
    // pending -> running -> completed | failed
    let requiredPreviousStatus: string;
    
    if (newStatus === 'running') {
      requiredPreviousStatus = 'pending';
    } else if (newStatus === 'completed' || newStatus === 'failed') {
      requiredPreviousStatus = 'running';
    } else {
      return null; // Invalid target status
    }

    // Atomic conditional update to handle concurrency
    const result = await this.prisma.job.updateMany({
      where: {
        id,
        status: requiredPreviousStatus,
      },
      data: {
        status: newStatus,
      },
    });

    if (result.count === 0) {
      // Either job doesn't exist, or it wasn't in the expected previous state
      return null;
    }

    // Fetch and return the updated job
    return this.prisma.job.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    }).catch(() => null); // Ignore if already deleted
  }
}
