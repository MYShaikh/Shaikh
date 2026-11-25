-- Schema for the Shaikh portfolio site, derived from the code in Shaikh.Server.
-- Safe to run more than once: every object is created only if it is missing.
--
--   AlumniController   -> INSERT INTO Alumni (School, IsAlumni)
--   ContactController  -> INSERT INTO dbo.Contacts (Name, Email, Subject, Body)
--   ViewersController  -> UPDATE TotalViewers SET ViewerCount = ViewerCount + 1   (needs exactly one row)
--                      -> INSERT INTO VisitorTypes (VisitorType, TimeZone)
--   ProjectsController -> EF Core DbSet<ProjectModel> Projects (Id, Title, Description)

IF OBJECT_ID(N'dbo.Alumni', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Alumni
    (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Alumni PRIMARY KEY,
        School      NVARCHAR(200)     NOT NULL,
        IsAlumni    BIT               NOT NULL,
        CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Alumni_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.Contacts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contacts
    (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Contacts PRIMARY KEY,
        Name        NVARCHAR(200)     NOT NULL,
        Email       NVARCHAR(320)     NOT NULL,
        Subject     NVARCHAR(300)     NOT NULL,
        Body        NVARCHAR(MAX)     NOT NULL,
        CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Contacts_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'dbo.VisitorTypes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VisitorTypes
    (
        Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_VisitorTypes PRIMARY KEY,
        VisitorType  NVARCHAR(100)     NOT NULL,
        TimeZone     NVARCHAR(100)     NOT NULL,
        CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_VisitorTypes_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- The increment endpoint runs UPDATE with no WHERE clause, so this table must hold exactly one row.
IF OBJECT_ID(N'dbo.TotalViewers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TotalViewers
    (
        ViewerCount INT NOT NULL CONSTRAINT DF_TotalViewers_ViewerCount DEFAULT 0
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TotalViewers)
    INSERT INTO dbo.TotalViewers (ViewerCount) VALUES (0);
GO

IF OBJECT_ID(N'dbo.Projects', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Projects
    (
        Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Projects PRIMARY KEY,
        Title        NVARCHAR(MAX)     NULL,
        Description  NVARCHAR(MAX)     NULL
    );
END;
GO
