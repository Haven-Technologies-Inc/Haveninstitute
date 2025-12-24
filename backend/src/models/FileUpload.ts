import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './User';

export type UploadType = 'avatar' | 'attachment' | 'material' | 'question_image' | 'other';

@Table({
  tableName: 'file_uploads',
  timestamps: false,
})
export class FileUpload extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'original_name',
  })
  originalName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'stored_name',
  })
  storedName!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    field: 'file_path',
  })
  filePath!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'file_size_bytes',
  })
  fileSizeBytes!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'mime_type',
  })
  mimeType!: string;

  @Default('other')
  @Column({
    type: DataType.ENUM('avatar', 'attachment', 'material', 'question_image', 'other'),
    field: 'upload_type',
  })
  uploadType!: UploadType;

  @Column({
    type: DataType.UUID,
    field: 'reference_id',
  })
  referenceId?: string;

  @Column({
    type: DataType.STRING(50),
    field: 'reference_type',
  })
  referenceType?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_public',
  })
  isPublic!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @BelongsTo(() => User)
  user?: User;

  // Get public URL
  get publicUrl(): string {
    return `/uploads/${this.storedName}`;
  }
}
