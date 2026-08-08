-- 1. تفعيل Realtime على class_activation_codes
ALTER TABLE class_activation_codes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE class_activation_codes;

-- 2. Trigger: عند حذف كود 7 خانات → احذف تفعيل الصف من student_class_activations
CREATE OR REPLACE FUNCTION handle_class_code_deleted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM student_class_activations
  WHERE class_id = OLD.class_id
    AND student_id IN (
      SELECT id FROM profiles WHERE device_id = OLD.device_id
    );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_class_code_deleted ON class_activation_codes;
CREATE TRIGGER on_class_code_deleted
  AFTER DELETE ON class_activation_codes
  FOR EACH ROW EXECUTE FUNCTION handle_class_code_deleted();