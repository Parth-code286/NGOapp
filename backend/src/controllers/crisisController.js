import supabase from '../config/supabaseClient.js';

// 1. Create a new crisis (For NGOs)
export const createCrisis = async (req, res) => {
  const { ngo_id, title, description, required_amount, upi_id } = req.body;

  if (!ngo_id || !title || !description || !required_amount) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('crises')
      .insert([{ ngo_id, title, description, required_amount, upi_id, collected_amount: 0, status: 'active' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Crisis created successfully', crisis: data });
  } catch (error) {
    console.error('Error creating crisis:', error);
    res.status(500).json({ error: 'Server error while creating crisis.' });
  }
};

// 2. Get all active crises (For Volunteers to browse)
export const getAllActiveCrises = async (req, res) => {
  try {
    // In a real app we would join with NGO profiles to get the NGO name
    const { data, error } = await supabase
      .from('crises')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ crises: data });
  } catch (error) {
    console.error('Error fetching crises:', error);
    res.status(500).json({ error: 'Server error while fetching crises.' });
  }
};

// 3. Donate to a crisis (For Volunteers / High Net-Worth Individuals)
export const donateToCrisis = async (req, res) => {
  const { crisis_id } = req.params;
  const { volunteer_id, amount, message } = req.body;

  if (!volunteer_id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid volunteer ID and amount are required.' });
  }

  try {
    // a. Record the donation
    const { data: donation, error: donationError } = await supabase
      .from('crisis_donations')
      .insert([{ crisis_id, volunteer_id, amount, message }])
      .select()
      .single();

    if (donationError) throw donationError;

    // b. Update the collected amount on the crisis
    // Fetch current amount first
    const { data: crisis, error: fetchError } = await supabase
      .from('crises')
      .select('collected_amount')
      .eq('id', crisis_id)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(crisis.collected_amount) + Number(amount);

    const { error: updateError } = await supabase
      .from('crises')
      .update({ collected_amount: newAmount })
      .eq('id', crisis_id);

    if (updateError) throw updateError;

    res.status(201).json({ 
      message: 'Donation successful!', 
      donation,
      new_total: newAmount
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ error: 'Server error while processing donation.' });
  }
};

// 4. Close a crisis (For NGOs)
export const closeCrisis = async (req, res) => {
  const { crisis_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('crises')
      .update({ status: 'resolved' })
      .eq('id', crisis_id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Crisis closed successfully', crisis: data });
  } catch (error) {
    console.error('Error closing crisis:', error);
    res.status(500).json({ error: 'Server error while closing crisis.' });
  }
};
