import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

const Notifications = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Notification settings will be available soon.</p>
      </CardContent>
    </Card>
  );
};

export default Notifications; 