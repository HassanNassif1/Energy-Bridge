BEGIN TRANSACTION;
ALTER TABLE [clients] ADD [dsp_name] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251121085135_AddDspToClients', N'9.0.7');

CREATE TABLE [BusinessTypes] (
    [id] int NOT NULL IDENTITY,
    [type] nvarchar(max) NULL,
    CONSTRAINT [PK_BusinessTypes] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251204072924_AddBusinessTypeTable', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251204115953_AddBusinessTypeToClients', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251204122309_InitialCreate', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251205091058_UpdateProductionSchema', N'9.0.7');

EXEC sp_rename N'[user_roles].[permissions]', N'Permissions', 'COLUMN';

ALTER TABLE [Users] ADD [Permissions] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251206152415_PermissionsToUsers', N'9.0.7');

COMMIT;
GO

