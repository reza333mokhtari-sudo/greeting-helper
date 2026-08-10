import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  description?: string;
}

interface EntityFormProps {
  entityName: string;
  fields: FieldConfig[];
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function EntityForm({ 
  entityName, 
  fields, 
  initialData, 
  onSubmit, 
  onCancel 
}: EntityFormProps) {
  const [busy, setBusy] = useState(false);

  // Dynamically build schema based on fields
  const schemaShape: Record<string, any> = {};
  fields.forEach(f => {
    if (f.type === 'boolean') {
      schemaShape[f.name] = z.boolean().default(false);
    } else if (f.type === 'number') {
      schemaShape[f.name] = z.coerce.number();
    } else {
      schemaShape[f.name] = z.string().min(1, `${f.label} is required`);
    }
  });
  const schema = z.object(schemaShape);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formField.value}
                        onCheckedChange={formField.onChange}
                      />
                    </div>
                  ) : field.type === "textarea" ? (
                    <Textarea {...formField} />
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      {...formField}
                    />
                  )}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} {entityName}
          </Button>
        </div>
      </form>
    </Form>
  );
}
