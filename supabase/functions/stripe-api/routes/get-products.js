var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for retrieving Stripe products (admin only)
export function handleGetProducts(req_1, _a) {
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
            // Check if user is an admin
            const { data: profile, error: profileError } = yield supabaseAdmin
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            if (profileError || !(profile === null || profile === void 0 ? void 0 : profile.is_admin)) {
                return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
                    status: 403,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Retrieve products from Stripe
            const products = yield stripe.products.list({
                active: true,
                expand: ['data.default_price'],
                limit: 100,
            });
            // Retrieve prices separately to get all prices, not just default ones
            const prices = yield stripe.prices.list({
                active: true,
                limit: 100,
            });
            // Organize prices by product
            const pricesByProduct = {};
            prices.data.forEach(price => {
                if (!pricesByProduct[price.product]) {
                    pricesByProduct[price.product] = [];
                }
                pricesByProduct[price.product].push(price);
            });
            // Combine products with their prices
            const productsWithPrices = products.data.map(product => (Object.assign(Object.assign({}, product), { prices: pricesByProduct[product.id] || [] })));
            return new Response(JSON.stringify({
                products: productsWithPrices,
            }), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error retrieving Stripe products:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
