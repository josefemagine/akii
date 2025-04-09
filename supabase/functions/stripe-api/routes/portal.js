var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for creating billing portal sessions
export function handleCreatePortal(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        try {
            // Get authentication context
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = yield supabaseAdmin.auth.getUser(token);
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Invalid token' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Get user's Stripe customer ID
            const { data: profile, error: profileError } = yield supabaseAdmin
                .from('profiles')
                .select('stripe_customer_id')
                .eq('id', user.id)
                .single();
            if (profileError || !(profile === null || profile === void 0 ? void 0 : profile.stripe_customer_id)) {
                return new Response(JSON.stringify({
                    error: 'No Stripe customer ID found for this user',
                    details: profileError || 'Missing customer data'
                }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Create billing portal session
            const session = yield stripe.billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${Deno.env.get('CLIENT_URL')}/dashboard/subscription`,
            });
            return new Response(JSON.stringify({ url: session.url }), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error creating portal session:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
