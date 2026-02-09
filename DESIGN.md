# System Design

## Database Schema Design and Entity Relationships

The system uses a relational database schema (SQLite) managed via TypeORM. The core entities and their relationships are designed to support a social media platform's basic features.

### Entities

1.  **User**
    - `id` (Primary Key, Increment): Unique identifier for each user.
    - `firstName`, `lastName`: User's name components.
    - `email` (Unique): User's email address, used for identification.
    - `createdAt`, `updatedAt`: Timestamps for record creation and last update.

2.  **Post**
    - `id` (Primary Key, Increment): Unique identifier for each post.
    - `content` (Text): The textual content of the post.
    - `authorId` (Foreign Key -> User.id): Reference to the user who created the post.
    - `createdAt`, `updatedAt`: Timestamps for record creation and last update.

3.  **Follow**
    - `followerId` (Primary Key, Foreign Key -> User.id): The user who is following.
    - `followingId` (Primary Key, Foreign Key -> User.id): The user being followed.
    - `followedAt` (Timestamp): When the follow relationship was established.
    - *Composite Primary Key: (`followerId`, `followingId`)*

4.  **Like**
    - `likerId` (Primary Key, Foreign Key -> User.id): The user who liked the post.
    - `postId` (Primary Key, Foreign Key -> Post.id): The post that was liked.
    - *Composite Primary Key: (`likerId`, `postId`)*

5.  **Hashtag**
    - `id` (Primary Key, Increment): Unique identifier for each hashtag entry.
    - `postId` (Foreign Key -> Post.id): Reference to the post containing the hashtag.
    - `value` (String): The tag value (stored in lowercase for case-insensitive matching).

6.  **Activity**
    - `id` (Primary Key, Increment): Unique identifier for each activity log entry.
    - `userId` (Foreign Key -> User.id): The user who is the subject of the activity.
    - `activityType` (String): Type of action (e.g., 'Post', 'Follow', 'Like', 'Unfollow').
    - `activityData` (Integer): Stores the ID of the related entity (e.g., Post ID for a 'Like' activity).
    - `createdAt`: Timestamp of the activity.

### Entity Relationships

-   **User & Post**: One-to-Many. A user can create multiple posts. Deleting a user removes all their posts.
-   **User & User (Follows)**: Many-to-Many self-relationship. A user can follow many users and can be followed by many users.
-   **User & Post (Likes)**: Many-to-Many. A user can like many posts, and a post can have many likes.
-   **Post & Hashtag**: One-to-Many. A post can have multiple hashtags.
-   **User & Activity**: One-to-Many. A user has a timeline of activities associated with them.

---

## Indexing Strategy for Performance Optimization

To ensure fast query performance as the data grows, the following indexing strategy is employed:

-   **Primary Keys**: All tables have primary keys which are automatically indexed by SQLite, providing efficient lookup time.
-   **Unique Indexes**: `User.email` is uniquely indexed to ensure data integrity and fast lookups during user identification.
-   **Composite Indexes**: The `Follow` and `Like` tables use composite primary keys. This automatically creates a unique index on the pair, optimizing queries that check for existing relationships (e.g., "Is Post X liked by User Y?").
-   **Foreign Key Indexes**: TypeORM automatically handles indexing for foreign keys in many relationships, which is crucial for join performance and maintaining referential integrity.
-   **Timeline Sorting**: Queries involving `orderBy` (like feed and activity timelines) benefit from indexes on `createdAt` columns to avoid expensive sorting operations on large result sets.

---

## Scalability Considerations and Solutions

### 1. Database Performance
-   **N+1 Query Resolution**: To scale the Feed and Activity features, the system should avoid N+1 queries. Current implementations that loop through results to fetch counts or related entities should be replaced with `LEFT JOIN`s or batch loading (`In` queries) to minimize database roundtrips.
-   **Pagination**: The API implements `limit` and `offset` pagination. This is essential for scalability as it prevents the system from attempting to load and transfer thousands of records in a single request.

### 2. Architectural Growth
-   **Database Migration**: While SQLite is suitable for initial stages, migrating to a production-grade RDBMS like **PostgreSQL** would be necessary to support high concurrency, row-level locking, and horizontal scaling.
-   **Caching**: Frequently accessed and relatively static data (like user profiles or popular hashtags) should be cached in an in-memory store like **Redis** to reduce the load on the primary database.
-   **Read/Write Splitting**: As the application becomes read-heavy (typical for social media), implementing read replicas can help distribute the load away from the primary write database.

### 3. Decoupling with Activity Logs
-   The `Activity` table decouples the recording of user actions from the primary business logic tables. This allows for building a unified timeline feature without needing complex and slow joins across multiple tables (Posts, Likes, Follows).

---

## Other Important Design Considerations

-   **Referential Integrity**: `ON DELETE CASCADE` is used for key relationships. This ensures that when a primary entity (like a User or Post) is deleted, all dependent records (Follows, Likes, Hashtags) are automatically cleaned up, maintaining a clean database state.
-   **Case Sensitivity**: Hashtags are converted to lowercase before storage to ensure consistent and case-insensitive hashtag discovery.
-   **Validation Middleware**: Centralized validation ensures that only well-formed data reaches the controllers and database, preventing common data integrity issues.
-   **Migration-Based Schema Management**: Using migrations instead of auto-sync ensures that schema changes are tracked in version control and can be safely applied across different environments (dev, staging, production).
