import { MigrationInterface, QueryRunner } from 'typeorm';

export class CountyDiacritics1794430000000 implements MigrationInterface {
  name = 'CountyDiacritics1794430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "_county" AS county
       SET "name" = spelling.corrected
       FROM (VALUES
          ('Arges', 'Argeș'),
          ('Bacau', 'Bacău'),
          ('Bistrita-Nasaud', 'Bistrița-Năsăud'),
          ('Botosani', 'Botoșani'),
          ('Braila', 'Brăila'),
          ('Brasov', 'Brașov'),
          ('Bucuresti', 'București'),
          ('Buzau', 'Buzău'),
          ('Calarasi', 'Călărași'),
          ('Caras Severin', 'Caraș-Severin'),
          ('Constanta', 'Constanța'),
          ('Dambovita', 'Dâmbovița'),
          ('Galati', 'Galați'),
          ('Ialomita', 'Ialomița'),
          ('Iasi', 'Iași'),
          ('Maramures', 'Maramureș'),
          ('Mehedinti', 'Mehedinți'),
          ('Mures', 'Mureș'),
          ('Neamt', 'Neamț'),
          ('Salaj', 'Sălaj'),
          ('Timis', 'Timiș'),
          ('Valcea', 'Vâlcea')
       ) AS spelling(original, corrected)
       WHERE county."name" = spelling.original`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "_county" AS county
       SET "name" = spelling.corrected
       FROM (VALUES
          ('Argeș', 'Arges'),
          ('Bacău', 'Bacau'),
          ('Bistrița-Năsăud', 'Bistrita-Nasaud'),
          ('Botoșani', 'Botosani'),
          ('Brăila', 'Braila'),
          ('Brașov', 'Brasov'),
          ('București', 'Bucuresti'),
          ('Buzău', 'Buzau'),
          ('Călărași', 'Calarasi'),
          ('Caraș-Severin', 'Caras Severin'),
          ('Constanța', 'Constanta'),
          ('Dâmbovița', 'Dambovita'),
          ('Galați', 'Galati'),
          ('Ialomița', 'Ialomita'),
          ('Iași', 'Iasi'),
          ('Maramureș', 'Maramures'),
          ('Mehedinți', 'Mehedinti'),
          ('Mureș', 'Mures'),
          ('Neamț', 'Neamt'),
          ('Sălaj', 'Salaj'),
          ('Timiș', 'Timis'),
          ('Vâlcea', 'Valcea')
       ) AS spelling(original, corrected)
       WHERE county."name" = spelling.original`,
    );
  }
}
