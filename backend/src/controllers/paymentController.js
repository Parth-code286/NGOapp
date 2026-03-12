import supabase from "../config/supabaseClient.js";

export const getWalletInfo = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId; // Assuming auth middleware attaches user
        if (!userId) return res.status(400).json({ error: "User ID required" });

        // Get balance
        let { data: wallet, error: wErr } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", userId)
            .single();

        if (wErr && wErr.code === 'PGRST116') {
            // Create wallet if not exists
            const { data: newWallet, error: cErr } = await supabase
                .from("wallets")
                .insert({ user_id: userId, balance: 0 })
                .select()
                .single();
            if (cErr) throw cErr;
            wallet = newWallet;
        } else if (wErr) throw wErr;

        // Get transactions
        const { data: transactions, error: tErr } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (tErr) throw tErr;

        res.json({
            balance: wallet.balance,
            transactions: transactions || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addFunds = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

        // Update balance
        const { data: wallet, error: wErr } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", userId)
            .single();

        if (wErr) throw wErr;

        const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

        const { error: uErr } = await supabase
            .from("wallets")
            .update({ balance: newBalance })
            .eq("user_id", userId);

        if (uErr) throw uErr;

        // Record transaction
        await supabase.from("transactions").insert({
            user_id: userId,
            amount: amount,
            type: 'ngo_deposit',
            description: 'Funds added to wallet'
        });

        res.json({ message: "Funds added successfully", newBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const processPayout = async (req, res) => {
    try {
        const ngoId = req.user?.id || req.body.ngoId;
        const { eventId, volunteerIds, amountPerVolunteer } = req.body;
        const totalAmount = volunteerIds.length * amountPerVolunteer;

        // Check NGO balance
        const { data: wallet, error: wErr } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", ngoId)
            .single();

        if (wErr) throw wErr;
        if (parseFloat(wallet.balance) < totalAmount) {
            return res.status(400).json({ error: "Insufficient wallet balance" });
        }

        // Process payouts (Atomic in a real app, here we loop for simplicity in simulation)
        for (const vId of volunteerIds) {
            // Update volunteer wallet (ensure it exists)
            const { data: vWallet, error: vWErr } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", vId)
                .single();

            let currentVBalance = 0;
            if (vWErr && vWErr.code === 'PGRST116') {
                await supabase.from("wallets").insert({ user_id: vId, balance: 0 });
            } else if (vWErr) throw vWErr;
            else currentVBalance = vWallet.balance;

            await supabase.from("wallets").update({ balance: parseFloat(currentVBalance) + amountPerVolunteer }).eq("user_id", vId);

            // Record transaction for volunteer
            await supabase.from("transactions").insert({
                user_id: vId,
                amount: amountPerVolunteer,
                type: 'payout_received',
                description: `Received payout for event ${eventId}`
            });
        }

        // Deduct from NGO
        const newNgoBalance = parseFloat(wallet.balance) - totalAmount;
        await supabase.from("wallets").update({ balance: newNgoBalance }).eq("user_id", ngoId);

        // Record transaction for NGO
        await supabase.from("transactions").insert({
            user_id: ngoId,
            amount: totalAmount,
            type: 'payout_sent',
            description: `Sent payout for event ${eventId} to ${volunteerIds.length} volunteers`
        });

        res.json({ message: `Payout of ₹${totalAmount} processed successfully.`, newBalance: newNgoBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
