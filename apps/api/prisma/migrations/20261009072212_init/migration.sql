-- CreateTable
CREATE TABLE "urls" (
    "id" UUID NOT NULL,
    "short_code" VARCHAR(16) NOT NULL,
    "original_url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE INDEX "urls_created_at_idx" ON "urls"("created_at" DESC);
