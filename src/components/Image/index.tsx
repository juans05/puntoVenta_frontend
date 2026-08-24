import React, { useRef, useState,useEffect } from 'react';
import styles from './image.module.css';
import { Icon } from '@iconify/react';


interface IImage {
  isLabel?: boolean;
  label?: string;
  accept: string;
  textAllowed: string;
  name:string;
  onImageChange?:any;
  value:any;
}

export const Image = ({ isLabel = false, label, accept, textAllowed, name,onImageChange,value }: IImage) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [, setLoading] = useState<boolean >(false);

  const handlePencilClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', "4devs-images");
        setLoading(true);

        const response = await fetch('https://api.cloudinary.com/v1_1/devs4/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const imageUrl = await response.json();
          setImageSrc(imageUrl.secure_url);
          console.log(imageUrl.secure_url)
          setLoading(false);
          if (onImageChange) {
            onImageChange(imageUrl.secure_url); // Llama a la función de devolución de llamada con el enlace generado
          }
        } else {
          console.error('File upload failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('An error occurred during file upload:', error);
        setLoading(false);
      }
    }
  };

  const handleLabelCloseClick = () => {
    setImageSrc(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (value) {
      setImageSrc(value);
    }
  }, [value]);

  return (
    <div>
      <div>
        {isLabel && <label className={styles['label']}>{label}</label>}

        <div>
          <div
            style={
              imageSrc
                ? { backgroundImage: `url(${imageSrc})` }
                : { backgroundColor: 'var(--neutral-100, #F1F3F6)' }
            }
            className={styles['image-input']}
          >
            <div className={styles['image-wrapper']}>{/* Image wrapper content here */}</div>

            <span className={styles['label-pencil']} onClick={handlePencilClick} title={'Cambiar Imagen'}>
              <Icon icon="simple-line-icons:pencil" />
              <input type="file" ref={fileInputRef} name={name} accept={accept} style={{ display: 'none' }} onChange={handleFileChange} />
              <input type="hidden" name="avatar_remove" value="1" />
            </span>

            {imageSrc && (
              <span className={styles['label-close']} onClick={handleLabelCloseClick} title={'Remover Imagen'}>
                <Icon icon="mi:close" />
              </span>
            )}
          </div>

          <div className={styles['form-text']}>{textAllowed}</div>
        </div>
      </div>
    </div>
  );
};
