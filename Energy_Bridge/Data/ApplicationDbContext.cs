using Energy_Bridge.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Energy_Bridge.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToTable("Users");
            
            modelBuilder.Entity<User>().Property(u => u.Permissions).HasColumnType("nvarchar(max)");
            modelBuilder.Entity<Client>().ToTable("Clients");
            modelBuilder.Entity<UserRoles>().ToTable("user_roles");
            modelBuilder.Entity<Ticket_Comments>().ToTable("ticket_comments");
  modelBuilder.Entity<UserHistory>().ToTable("user_history");
      modelBuilder.Entity<TicketHistory>().ToTable("TicketHistories");

            modelBuilder.Entity<Dsp>().ToTable("Dsps");

            modelBuilder.Entity<Service>().ToTable("services");

            // Define foreign key relationship between Ticket and User
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.User)
                .WithMany() // Assuming User doesn't have a Tickets navigation property
                .HasForeignKey(t => t.user_id)
                .OnDelete(DeleteBehavior.SetNull); // Or Cascade based on your needs
  modelBuilder.Entity<TicketHistory>(entity =>
{
    entity.ToTable("TicketHistories");
    entity.HasKey(th => th.id);

    entity.Property(th => th.ticket_id).IsRequired();
    entity.Property(th => th.user_id).IsRequired(false); // nullable
    entity.Property(th => th.client_id).HasMaxLength(100).IsRequired(false);
    entity.Property(th => th.subject).HasMaxLength(200).IsRequired(false);
    entity.Property(th => th.description).IsRequired(false);
    entity.Property(th => th.category).HasMaxLength(50).IsRequired(false);
    entity.Property(th => th.severity).HasMaxLength(50).IsRequired(false);
    entity.Property(th => th.status).HasMaxLength(50).IsRequired(false);
    entity.Property(th => th.assigned_to).IsRequired(false);
    entity.Property(th => th.call_source).HasMaxLength(50).IsRequired(false);
    entity.Property(th => th.notification).HasMaxLength(100).IsRequired(false);
    entity.Property(th => th.created_at).HasDefaultValueSql("GETDATE()");

    // NO navigation property here
});


            modelBuilder.Entity<Ticket_Comments>()
    .HasOne(tc => tc.Ticket)
    .WithMany() // or .WithMany(t => t.Comments) if you add a collection in Ticket
    .HasForeignKey(tc => tc.ticket_id)
    .OnDelete(DeleteBehavior.Cascade);
        }

        public DbSet<User> Users { get; set; }
             public DbSet<UserHistory> UserHistories { get; set; }
        public DbSet<Client> Clients { get; set; }

        public DbSet<Dsp> Dsps { get; set; }
        public DbSet<UserRoles> UserRoles { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Package> Packages { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Stock> Stock { get; set; }
        public DbSet<Brand> Brand { get; set; }

        public DbSet<Types> Types { get; set; }
        public DbSet<Ticket_Comments> Ticket_Comments { get; set; }
        public DbSet<Supplier> Supplier { get; set; }
        
      public DbSet<TicketHistory> TicketHistories { get; set; }
          public DbSet<BusinessType> BusinessTypes { get; set; }


    }
}
