# Bedrock Component Fixes

Here are the necessary changes to fix the SupabaseBedrock.tsx file:

## 1. Add customInstanceName state to SupabaseBedrock Component

Look for the state declarations section of SupabaseBedrock component, and add:

```tsx
// Add this after the selectedModelId state declaration
const [customInstanceName, setCustomInstanceName] = useState<string>('');
```

## 2. Fix the fetchAvailableModels function signature

Change the function signature from:

```tsx
const fetchAvailableModels = async (filters: Partial<ModelFilter> = {}) => {
```

to:

```tsx
const fetchAvailableModels = async (filters: Record<string, string> = {}) => {
```

## 3. Fix the handleProvisionInstance function

Inside the handleProvisionInstance function, add the logic to use the customInstanceName:

```tsx
// Before calling the API to create the instance
const instanceName = customInstanceName || `akii-${modelId.split('/').pop()}-${new Date().toISOString().split('T')[0]}`;
```

## 4. Add the input field to the UI

In the Create Instance form, add:

```tsx
<div className="grid w-full gap-2">
  <Label htmlFor="instance-name">Instance Name</Label>
  <Input
    id="instance-name"
    placeholder="Custom instance name (optional)"
    value={customInstanceName}
    onChange={(e) => setCustomInstanceName(e.target.value)}
  />
  <p className="text-sm text-muted-foreground">
    Optional: Provide a custom name for this instance or leave blank for auto-generated name
  </p>
</div>
```

## 5. Fix JSX structure in BedrockDashboardContent

Wrap the return statement with a fragment to fix the JSX structure error:

```tsx
return (
  <>
    <div className="container p-6 space-y-6">
      {/* Existing content */}
    </div>
  </>
);
```

## 6. Running the build

After making these changes, run:

```
npm run build
``` 