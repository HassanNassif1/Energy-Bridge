IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [services] (
    [id] int NOT NULL IDENTITY,
    [service_name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_services] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250724092118_Service', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250727193722_AlterClientIdColumnToString', N'9.0.7');

ALTER TABLE [Tickets] ADD [Userid] int NULL;

ALTER TABLE [Tickets] ADD [user_id] int NULL;

CREATE INDEX [IX_Tickets_Userid] ON [Tickets] ([Userid]);

ALTER TABLE [Tickets] ADD CONSTRAINT [FK_Tickets_Users_Userid] FOREIGN KEY ([Userid]) REFERENCES [Users] ([id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250730071240_AddUserIdToTickets', N'9.0.7');

ALTER TABLE [Tickets] DROP CONSTRAINT [FK_Tickets_Users_Userid];

DROP INDEX [IX_Tickets_Userid] ON [Tickets];

DECLARE @var sysname;
SELECT @var = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tickets]') AND [c].[name] = N'Userid');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Tickets] DROP CONSTRAINT [' + @var + '];');
ALTER TABLE [Tickets] DROP COLUMN [Userid];

CREATE TABLE [Stock] (
    [id] int NOT NULL IDENTITY,
    [connections] nvarchar(max) NOT NULL,
    [link_name] nvarchar(max) NOT NULL,
    [type] nvarchar(max) NOT NULL,
    [brand] nvarchar(max) NOT NULL,
    [sn] nvarchar(max) NOT NULL,
    [supplier] nvarchar(max) NOT NULL,
    [price] int NOT NULL,
    [antenna_size] int NOT NULL,
    [status] nvarchar(max) NOT NULL,
    [purchase_date] datetime2 NOT NULL,
    [created_by] int NULL,
    [created_on] datetime2 NOT NULL,
    CONSTRAINT [PK_Stock] PRIMARY KEY ([id])
);

CREATE INDEX [IX_Tickets_user_id] ON [Tickets] ([user_id]);

ALTER TABLE [Tickets] ADD CONSTRAINT [FK_Tickets_Users_user_id] FOREIGN KEY ([user_id]) REFERENCES [Users] ([id]) ON DELETE SET NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250805115211_AddStock', N'9.0.7');

CREATE TABLE [Brand] (
    [id] int NOT NULL IDENTITY,
    [brand] nvarchar(max) NOT NULL,
    [status] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Brand] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250805115355_AddBrand', N'9.0.7');

CREATE TABLE [Types] (
    [id] int NOT NULL IDENTITY,
    [type] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Types] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250805115443_AddTypes', N'9.0.7');

CREATE TABLE [Supplier] (
    [id] int NOT NULL IDENTITY,
    [supplier] nvarchar(max) NOT NULL,
    [mobile] nvarchar(max) NOT NULL,
    [email] nvarchar(max) NOT NULL,
    [status] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Supplier] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250805115548_AdSupplier', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250812102354_AddAccountStatusToUsers', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250812120944_deleteaccountstatus', N'9.0.7');

ALTER TABLE [Tickets] ADD [notification] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250812175346_notificationcolumn', N'9.0.7');

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tickets]') AND [c].[name] = N'notification');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Tickets] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Tickets] ALTER COLUMN [notification] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250812182009_allownullnotification', N'9.0.7');

ALTER TABLE [user_roles] ADD [permissions] nvarchar(max) NULL;

ALTER TABLE [Services] DROP CONSTRAINT [PK_Services];

EXEC sp_rename N'[Services]', N'services', 'OBJECT';

ALTER TABLE [services] ADD CONSTRAINT [PK_services] PRIMARY KEY ([id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250814073437_AddPemissionsColumn', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250825071314_AddTicketHistoriesTable', N'9.0.7');

ALTER TABLE [Tickets] ADD [isViewed] bit NOT NULL DEFAULT CAST(0 AS bit);

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'subject');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [subject] nvarchar(200) NULL;

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'status');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [status] nvarchar(50) NULL;

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'severity');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [severity] nvarchar(50) NULL;

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'notification');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [notification] nvarchar(100) NULL;

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'created_at');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [TicketHistories] ADD DEFAULT (GETDATE()) FOR [created_at];

DECLARE @var7 sysname;
SELECT @var7 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'client_id');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var7 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [client_id] nvarchar(100) NULL;

DECLARE @var8 sysname;
SELECT @var8 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'category');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var8 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [category] nvarchar(50) NULL;

DECLARE @var9 sysname;
SELECT @var9 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TicketHistories]') AND [c].[name] = N'call_source');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [TicketHistories] DROP CONSTRAINT [' + @var9 + '];');
ALTER TABLE [TicketHistories] ALTER COLUMN [call_source] nvarchar(50) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250826073658_AddIsViewedToTicket', N'9.0.7');

ALTER TABLE [TicketHistories] ADD [isViewed] bit NOT NULL DEFAULT CAST(0 AS bit);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250826073735_AddIsViewedToTicketHistory', N'9.0.7');

DECLARE @var10 sysname;
SELECT @var10 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tickets]') AND [c].[name] = N'assigned_username');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Tickets] DROP CONSTRAINT [' + @var10 + '];');
ALTER TABLE [Tickets] DROP COLUMN [assigned_username];

ALTER TABLE [Tickets] ADD [assigned_user] int NULL;

ALTER TABLE [TicketHistories] ADD [assigned_user] int NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250829104220_AddAssignedUsername', N'9.0.7');

CREATE TABLE [user_history] (
    [id] int NOT NULL IDENTITY,
    [username] nvarchar(max) NOT NULL,
    [password] nvarchar(max) NOT NULL,
    [role_id] int NULL,
    [status] nvarchar(max) NULL,
    CONSTRAINT [PK_user_history] PRIMARY KEY ([id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902114236_AddUserHistoryTable', N'9.0.7');

ALTER TABLE [user_history] ADD [isLogged] bit NOT NULL DEFAULT CAST(0 AS bit);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902114533_AddIsLogged', N'9.0.7');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902114624_AddIsLoggedUser', N'9.0.7');

ALTER TABLE [user_history] ADD [created_at] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902122314_AddCreatedAt', N'9.0.7');

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

