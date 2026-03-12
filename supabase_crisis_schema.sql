-- Table for NGOs to list severe crises
CREATE TABLE crises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID NOT NULL, -- references ngo profiles or auth users
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_amount DECIMAL(12,2) NOT NULL,
  collected_amount DECIMAL(12,2) DEFAULT 0,
  upi_id TEXT,
  status TEXT DEFAULT 'active', -- 'active' or 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking donations to these crises
CREATE TABLE crisis_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID REFERENCES crises(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL, -- references volunteer profiles
  amount DECIMAL NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: You should enable RLS and add policies if restricting access in Supabase.
-- For this backend architecture, we will manage access via our Node.js Express server.

ALTER TABLE crises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to crises" ON crises FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to crises" ON crises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to crises" ON crises FOR UPDATE USING (true);

ALTER TABLE crisis_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read to donations" ON crisis_donations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to donations" ON crisis_donations FOR INSERT WITH CHECK (true);

-- Insert dummy crises
INSERT INTO crises (ngo_id, title, description, required_amount, collected_amount, status) VALUES 
('00000000-0000-0000-0000-000000000000', 'Assam Flood Relief Fund', 'Emergency relief funds needed to provide shelter, food, and medical supplies to the victims of the recent catastrophic floods in Assam.', 50000.00, 12500.00, 'active'),
('00000000-0000-0000-0000-000000000000', 'Provide Medical Aid for Gaza', 'Urgent medical supplies and humanitarian aid required for displaced children and families.', 100000.00, 89000.00, 'active'),
('00000000-0000-0000-0000-000000000000', 'Rebuilding Kerala School', 'A local primary school was destroyed in a landslide. We are raising funds to rebuild the infrastructure and provide study materials.', 25000.00, 5000.00, 'active');
