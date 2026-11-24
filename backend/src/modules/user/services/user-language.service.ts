import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  AdminUserEntity,
  RegularUserEntity,
  UserEntity,
} from '../entities/user.entity';
import { Language, UserType } from '../enums/user.enum';

// The language a person reads VIC in (apps, push notifications, emails). Null = not chosen yet.
@Injectable()
export class UserLanguageService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminUserEntity)
    private readonly adminRepository: Repository<AdminUserEntity>,
    @InjectRepository(RegularUserEntity)
    private readonly regularRepository: Repository<RegularUserEntity>,
  ) {}

  async byUserId(id: string): Promise<Language | null> {
    if (!id) return null;
    return (await this.byUserIds([id])).get(id) ?? null;
  }

  async byUserIds(ids: string[]): Promise<Map<string, Language | null>> {
    const wanted = [...new Set((ids ?? []).filter(Boolean))];
    if (!wanted.length) return new Map();
    const users = await this.userRepository.find({
      where: { id: In(wanted) },
      select: { id: true, language: true },
    });
    return new Map(users.map((user) => [user.id, user.language ?? null]));
  }

  // Keyed by the lowercased email. An email with no user of that type is missing from the map.
  async byEmails(
    emails: string[],
    type: UserType,
  ): Promise<Map<string, Language | null>> {
    const wanted = [
      ...new Set((emails ?? []).filter(Boolean).map((e) => e.toLowerCase())),
    ];
    if (!wanted.length) return new Map();
    const repository: Repository<UserEntity> =
      type === UserType.ADMIN ? this.adminRepository : this.regularRepository;
    const users = await repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.language'])
      .where('LOWER(user.email) IN (:...emails)', { emails: wanted })
      .getMany();
    return new Map(
      users.map((user) => [user.email.toLowerCase(), user.language ?? null]),
    );
  }

  // The person chose this language: it replaces whatever was stored.
  async set(id: string, language: Language): Promise<Language> {
    await this.userRepository.update({ id }, { language });
    return language;
  }

  // The app reports the language it detected: kept only when the person has none yet.
  // Returns the language that is stored afterwards.
  async fillIfEmpty(id: string, language: Language): Promise<Language> {
    await this.userRepository.update({ id, language: IsNull() }, { language });
    return (await this.byUserId(id)) ?? language;
  }
}
