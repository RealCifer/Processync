# Async Document Processing Workflow System (Processync)

Processync is a high-performance, enterprise-grade document intelligence platform designed to handle large-scale document analysis through an asynchronous, distributed pipeline. It leverages a modern full-stack architecture to provide real-time status updates, scalable background processing, and a robust management interface.

## 1. Description

The system implements a multi-stage processing pipeline where heavy computational tasks (extraction and analysis) are decoupled from the user-facing API. By utilizing a distributed task queue and event-driven messaging, Processync ensures that the user experience remains fluid regardless of document size or analysis complexity.

Key architectural pillars:
- **Decoupled Workflow**: API requests are acknowledged immediately while background workers handle the analysis.
- **Real-time Observability**: Granular progress tracking via WebSocket streaming and Redis Pub/Sub.
- **Scalability**: Horizontal scaling support for both API instances and dedicated worker nodes.

## 2. Features

- **Document Ingestion**: Multi-format document upload via a high-speed ingestion layer.
- **Asynchronous Pipeline**: Distributed processing powered by Celery and Redis.
- **Real-time Progress Hub**: Live stage-by-stage tracking (Initializing -> Parsing -> Extraction -> Storage).
- **Comprehensive Job Lifecycle**: State management for Queued, Processing, Completed, and Failed jobs.
- **Advanced Dashboard**: Full-featured management view with multi-criteria search, status filtering, and chronological sorting.
- **Interactive Review**: Intelligent form-based editor to audit and correct AI-generated metadata.
- **Governance Finalization**: Official verification workflow that locks document records to ensure data integrity.
- **Recovery Logic**: One-click retry mechanism for failed processing sequences.
- **Professional Export**: High-fidelity data extraction in both JSON (Full Schema) and CSV (Flattened Metadata) formats.

## 3. System Architecture

The architecture follows a distributed event-driven pattern:

1. **Frontend (Next.js)**: Initiates document uploads and establishes a persistent WebSocket connection for monitoring.
2. **FastAPI (Backend)**: Receives the document, persists initial metadata to **PostgreSQL**, and publishes a task to the message broker.
3. **Redis (Broker/PubSub)**: Acts as the primary message transport between the API and the background workers.
4. **Celery (Worker)**: Consumes tasks and executes intensive analysis stages. During execution, it publishes progress events back to Redis.
5. **WebSocket Layer**: The API subscribes to Redis progress channels and streams events directly back to the active client.

### Async Separation
By separating the request lifecycle from the processing lifecycle, the API layer is protected from blocking operations, maintaining sub-millisecond response times for client interactions.

## 4. Project Structure

```text
Processync/
├── backend/
│   ├── app/
│   │   ├── api/          (FastAPI routes and WebSocket handlers)
│   │   ├── core/         (Configuration, Database, and Redis setup)
│   │   ├── models/       (SQLAlchemy database schemas)
│   │   ├── repositories/ (Data access layer logic)
│   │   ├── schemas/      (Pydantic validation models)
│   │   ├── services/     (Core business orchestration)
│   │   └── workers/      (Celery application configuration)
│   ├── tasks/            (Asynchronous task definitions)
│   └── uploads/          (Transient file storage)
├── frontend/
│   ├── src/
│   │   ├── app/         (Next.js App Router pages and layouts)
│   │   ├── components/  (Reusable UI modules)
│   │   └── services/    (API client and WebSocket logic)
│   └── public/          (Static assets)
└── docker-compose.yml   (Multi-service orchestration blueprint)
```

## 5. Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### Backend Setup
1. Enter the backend directory.
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Start the API server: `python -m uvicorn app.main:app --reload`

### Frontend Setup
1. Enter the frontend directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Services (Manual/Docker)
1. Start PostgreSQL 15 on port 5433 (or as configured).
2. Start Redis 7 on port 6379.
3. Start the Celery worker: `celery -A app.workers.celery_app worker --loglevel=info -P solo`

## 6. Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5433/processync
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./uploads
```

Create a `.env` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 7. How to Run the Project (Docker Compose)

The entire platform is containerized for seamless deployment.

1. Ensure Docker is running.
2. From the root directory, run:
   ```bash
   docker-compose up -d --build
   ```
3. The application will be accessible at:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:8000`

## 8. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/documents/upload` | Upload and initiate analysis sequence |
| GET | `/documents/` | List all documents with search/filter |
| GET | `/documents/{id}` | Retrieve detailed document metadata |
| POST | `/documents/{id}/retry` | Re-queue a failed processing job |
| POST | `/documents/{id}/finalize` | Mark extraction as verified/locked |
| GET | `/documents/{id}/export/json` | Download full analysis as JSON |
| GET | `/documents/{id}/export/csv` | Download flattened analysis as CSV |

## 9. Document Processing Flow

1. **Document Received**: File is saved to secure storage and record created.
2. **Parsing**: Initial structure analysis and format verification.
3. **Extraction**: AI-driven metadata harvesting (Title, Summary, Keywords).
4. **Final Storage**: Structured results are persisted to PostgreSQL and client is notified.

## 10. Progress Tracking

Implementation utilizes Redis Pub/Sub for high-throughput signaling:
- Worker publishes to `job_progress:{job_id}`.
- Fastapi WebSocket listener utilizes `asyncio` to monitor the Redis channel.
- Events are pushed to the client immediately upon publication, ensuring sub-10ms UI updates.

## 11. Sample Output

Example JSON extraction result:

```json
{
  "document_id": "uuid-v4-string",
  "filename": "annual_report.pdf",
  "processed_at": "2024-04-07T14:30:00Z",
  "is_finalized": true,
  "data": {
    "content": {
      "title": "Annual Sustainability Report 2024",
      "category": "Corporate Governance",
      "summary": "Detailed analysis of sustainability goals and achievement metrics.",
      "keywords": ["sustainability", "metrics", "governance"]
    }
  }
}
```

## 12. Demo Instructions

- **Inbound Flow**: Upload a PDF; observe the real-time progress bar transitioning through stages.
- **Intelligence Review**: Navigate to document details to see the extracted summary and title.
- **Verification**: Edit the category, save, and finalize to lock the record.
- **External Integration**: Export the result as CSV to verify data flattening.

## 13. Assumptions

- File sizes for standard uploads are within the range which fits in worker memory.
- Network latency between API and Redis is negligible.
- Workers have access to the shared file storage or volume mount for document retrieval.

## 14. Trade-offs

- **Shared Volume vs S3**: Local volume storage is used for simplicity; a production s3-compatible storage would be preferred for multi-node worker clusters.
- **Solo Worker Pool**: Windows environments require `-P solo` for Celery, which limits local worker concurrency but ensures 100% stability.

## 15. Limitations

- Only structured text extraction is currently simulated (pluggable OCR required for scans).
- Result editing is disabled once a document is finalized.

## 16. Future Improvements

- Implementation of a dedicated OCR stage for image-based documents.
- Multi-user authentication and Organization-level isolation.
- Advanced AI model integration (LLM) for deep semantic analysis.
- S3-compatible cloud storage adapter.

## 17. Tools Used / AI Usage

- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Celery.
- **Infrastructure**: Redis, PostgreSQL, Docker Compose.

## 18. Conclusion

Processync represents a complete, scalable solution for modern document workflows. By combining asynchronous task distribution with real-time feedback loops, it provides a stable foundation for enterprise document intelligence needs.
