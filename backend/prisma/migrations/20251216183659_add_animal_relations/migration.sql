-- AddForeignKey
ALTER TABLE `animal_images` ADD CONSTRAINT `animal_images_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
