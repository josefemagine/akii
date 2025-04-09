# Function Status Tracking

## Updated Functions (Using Shared Auth Utilities)
1. ✅ admin-get-stripe-products
2. ✅ admin-subscription-analytics
3. ✅ sync-plan-to-stripe
4. ✅ billing-summary
5. ✅ health-check
6. ✅ chat
7. ✅ chat_with_agent
8. ✅ process_document
9. ✅ update_user_usage
10. ✅ test_fireworks_models
11. ✅ subscription_webhook
12. ✅ create_agent
13. ✅ private_ai_deploy
14. ✅ generate_api_key
15. ✅ check_credentials
16. ✅ team_invite
17. ✅ stripe-webhook
18. ✅ super-action
19. ✅ check_edge_functions
20. ✅ accept_invite
21. ✅ delete_agent
22. ✅ update_agent
23. ✅ list_agents
24. ✅ get_agent
25. ✅ run_migration
26. ✅ bedrock
27. ✅ create-checkout
28. ✅ create-portal
29. ✅ update-subscription
30. ✅ cancel-subscription
31. ✅ team_remove
32. ✅ stripe-api
33. ✅ private_ai_completion
34. ✅ ensure_profile_exists
35. ✅ admin_get_team_usage
36. ✅ admin-get-teams ✅
37. ✅ admin_get_user_usage
38. ✅ admin-get-user ✅
39. ✅ admin-get-users
40. ✅ get_user_usage
41. ✅ update_team
42. ✅ user_get_stripe_products ✅
43. ✅ user_get_teams ✅
44. ✅ user_get_usage ✅
45. ✅ run_agent
46. ✅ update_user_setup
47. ✅ stripe
48. ✅ stripe-webhooks ✅
49. ✅ admin_get_stripe_products
50. ✅ admin_update_user

## Functions Without Auth (Intentionally)
1. 🔓 test-function (Simple test endpoint for development)

## Authentication Status

### Updated Functions
- update_user_usage
- list_models
- admin-get-stripe-products
- private_ai_deploy
- private_ai_list
- private_ai_undeploy
- stripe-api
- super_action
- team_invite
- team_remove
- update_agent
- chat_with_agent
- create_agent
- run_agent
- accept_invite
- create_team
- update_team
- update_user_setup
- ensure_profile_exists
- list_agents
- stripe
- stripe-webhooks

### N/A (No Database Interaction)
- process_document
- check_edge_functions
- admin-update-user
- admin_get_teams
- admin_get_user
- user_get_stripe_products ✅
- user_get_usage ✅

### No Database Interaction Needed
- health-check
- process_document
- check_edge_functions
- admin-update-user
- admin_get_teams
- admin_get_user
- user_get_stripe_products
- user_get_usage
- admin-get-stripe-products ✅
- admin-get-teams ✅
- admin-get-users
- admin_get_stripe_products
- admin_get_team_usage
- admin_update_user
- cancel-subscription
- check_credentials
- run_migration

## Postgres Implementation Status

### Updated Functions
- update_user_usage ✅
- list_models ✅
- admin-get-stripe-products ✅
- private_ai_deploy ✅
- private_ai_list ✅
- private_ai_undeploy ✅
- stripe-api ✅
- super_action ✅
- team_invite ✅
- team_remove ✅
- update_agent ✅
- chat_with_agent ✅
- create_agent ✅
- run_agent ✅
- accept_invite ✅
- create_team ✅
- update_team ✅
- update_user_setup ✅
- ensure_profile_exists ✅
- list_agents ✅
- stripe ✅
- stripe-webhooks ✅
- health-check ✅
- check_credentials ✅
- admin-get-stripe-products ✅
- admin-get-teams ✅
- admin-get-user ✅
- admin-get-users ✅
- admin_get_stripe_products ✅
- admin_get_team_usage ✅
- admin_update_user ✅
- cancel-subscription ✅
- run_migration ✅
- user_get_teams ✅
- user_get_usage ✅
- admin_get_teams ✅
- admin_get_user ✅
- user_get_stripe_products ✅
- is_super_admin - Created with Postgres utilities

## Notes
- Functions marked with ✅ are fully updated and using shared auth utilities
- Functions marked with 🔓 intentionally don't use auth for testing/development purposes