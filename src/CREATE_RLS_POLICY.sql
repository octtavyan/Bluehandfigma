-- ✅ RLS Policy for netopia_ipn_queue Table
-- This allows the public IPN endpoint to insert webhook notifications

-- Allow anyone to INSERT into netopia_ipn_queue
CREATE POLICY "Allow public insert for Netopia IPN"
ON netopia_ipn_queue
FOR INSERT
WITH CHECK (true);

-- Optionally, allow service role to SELECT/UPDATE for processing
CREATE POLICY "Allow service role to process IPN queue"
ON netopia_ipn_queue
FOR ALL
USING (true)
WITH CHECK (true);
