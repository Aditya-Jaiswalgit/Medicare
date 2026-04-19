import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id?: string;
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  close?: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  plan,
}: SubscriptionDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: "",
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch(
        "http://localhost:5000/api/subscriptions/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: plan?.id,
            ...formData,
          }),
        },
      );

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: "Hospital Management System",
        description: `${plan?.name} Plan Subscription`,
        order_id: orderResult.data.order_id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch(
            "http://localhost:5000/api/subscriptions/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pending_clinic_id: orderResult.data.pending_clinic_id,
              }),
            },
          );

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            toast.success("Payment successful! Your clinic has been created.");
            toast.success(
              `Login with: ${verifyResult.data.admin_email} / ${verifyResult.data.default_password}`,
            );
            navigate("/login");
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: formData.admin_name,
          email: formData.admin_email,
          contact: formData.admin_phone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name} Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Clinic Name *</Label>
              <Input
                required
                value={formData.clinic_name}
                onChange={(e) =>
                  setFormData({ ...formData, clinic_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Admin Name *</Label>
              <Input
                required
                value={formData.admin_name}
                onChange={(e) =>
                  setFormData({ ...formData, admin_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Admin Email *</Label>
              <Input
                type="email"
                required
                value={formData.admin_email}
                onChange={(e) =>
                  setFormData({ ...formData, admin_email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Admin Phone *</Label>
              <Input
                required
                value={formData.admin_phone}
                onChange={(e) =>
                  setFormData({ ...formData, admin_phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">Total: ₹{plan.price}</p>
            <p className="text-sm text-muted-foreground">
              You'll receive login credentials after payment
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${plan.price}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
