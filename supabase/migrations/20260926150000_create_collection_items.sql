create table if not exists public.collection_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  set_key text not null,
  card_id integer not null check (card_id > 0),
  collected_at timestamptz not null default now(),
  primary key (user_id, set_key, card_id)
);

alter table public.collection_items enable row level security;

drop policy if exists "Users can read their own collection items" on public.collection_items;
create policy "Users can read their own collection items"
on public.collection_items
for select
using (auth.uid() = user_id);

drop policy if exists "Users can add their own collection items" on public.collection_items;
create policy "Users can add their own collection items"
on public.collection_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own collection items" on public.collection_items;
create policy "Users can remove their own collection items"
on public.collection_items
for delete
using (auth.uid() = user_id);