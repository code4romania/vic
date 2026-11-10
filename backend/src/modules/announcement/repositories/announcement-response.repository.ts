import { BadRequestException, Injectable } from '@nestjs/common';
import { AnnouncementExceptionMessages } from '../exceptions/announcement.exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { In, Repository } from 'typeorm';
import { AnnouncementResponseEntity } from '../entities/announcement-response.entity';
import {
  CreateAnnouncementResponseOptions,
  FindManyAnnouncementResponsesOptions,
  IAnnouncementResponseModel,
} from '../models/announcement-response.model';

// #504
@Injectable()
export class AnnouncementResponseRepository {
  constructor(
    @InjectRepository(AnnouncementResponseEntity)
    private readonly responseRepository: Repository<AnnouncementResponseEntity>,
  ) {}

  // A second answer (two taps arriving together pass the "already answered" check) hits the unique
  // constraint: 400 ANNOUNCEMENT_007 like the check, not a 500.
  async create(options: CreateAnnouncementResponseOptions): Promise<string> {
    try {
      const saved = await this.responseRepository.save(
        this.responseRepository.create(options),
      );
      return saved.id;
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') {
        throw new BadRequestException(
          AnnouncementExceptionMessages.ANNOUNCEMENT_007,
        );
      }
      throw error;
    }
  }

  async exists(announcementId: string, userId: string): Promise<boolean> {
    return this.responseRepository.exist({
      where: { announcementId, userId },
    });
  }

  // the user's own answers, by announcement
  async findForUser(
    userId: string,
    announcementIds: string[],
  ): Promise<Record<string, { comment: string; createdOn: Date }>> {
    if (!announcementIds.length) return {};
    const rows = await this.responseRepository.find({
      where: { userId, announcementId: In(announcementIds) },
    });
    return Object.fromEntries(
      rows.map((row) => [
        row.announcementId,
        { comment: row.comment, createdOn: row.createdOn },
      ]),
    );
  }

  // newest first, with the volunteer's name and the email they gave the organization
  async findMany({
    announcementId,
    limit,
    page,
  }: FindManyAnnouncementResponsesOptions): Promise<
    Pagination<IAnnouncementResponseModel>
  > {
    const [{ total }] = await this.responseRepository.query(
      `SELECT count(*) AS total FROM announcement_response WHERE announcement_id = $1 AND deleted_on IS NULL`,
      [announcementId],
    );
    const rows = await this.responseRepository.query(
      `SELECT r.id, r.announcement_id AS "announcementId", r.comment, r.created_on AS "createdOn",
              r.volunteer_id AS "volunteerId", u.id AS "userId", u.name AS "userName",
              COALESCE(vp.email, u.email) AS "userEmail"
       FROM announcement_response r
       JOIN "user" u ON u.id = r.user_id
       LEFT JOIN volunteer v ON v.id = r.volunteer_id
       LEFT JOIN volunteer_profile vp ON vp.id = v.volunteer_profile_id
       WHERE r.announcement_id = $1 AND r.deleted_on IS NULL
       ORDER BY r.created_on DESC
       LIMIT $2 OFFSET $3`,
      [announcementId, limit, (page - 1) * limit],
    );
    const totalItems = +total;
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: rows.map((row: Record<string, any>) => ({
        id: row.id,
        announcementId: row.announcementId,
        comment: row.comment,
        createdOn: row.createdOn,
        volunteerId: row.volunteerId,
        user: { id: row.userId, name: row.userName, email: row.userEmail },
      })),
      meta: {
        itemCount: rows.length,
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}
