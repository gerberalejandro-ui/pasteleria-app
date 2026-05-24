import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ptvnqhvuzujxnhvwwtjx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dm5xaHZ1enVqeG5odnd3dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODMwOTUsImV4cCI6MjA5NTA1OTA5NX0.wj7wHShYeaOweWwWuanPq5gVDEcIzzgBsRw110Mpa5o"
);