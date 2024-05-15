import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { UserPhoto } from '../model/UserPhoto';

interface fileT {
  ctime: number;
  mtime: number;
  name: string;
  size: number;
  type: string;
  uri: string;
}

const REPO_CACHE: string = 'vistorias-img';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];

  public REPO_CACHE: string = 'vistorias';


  constructor() { }

  public async addNewToGallery() {

    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    if (capturedPhoto) {
      const savedImageFile = await this.savePicture(capturedPhoto);
    }
 

  }


  private async savePicture(photo: Photo) {

    const base64Data = await this.readAsBase64(photo);
  
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${REPO_CACHE}/${fileName}`,
      data: base64Data,
      recursive: true,
      directory: Directory.Data
    });

    this.loadFiles();

    // console.log('Leitura da foto: ', ImageFile);
    // this.photos.unshift(ImageFile);
    
  }






  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  public async loadFiles() {
    Filesystem.readdir({
      path: REPO_CACHE,
      directory: Directory.Data
    }).then(result => {
      console.log('Result: ', result);
      console.log('ResultFiles: ', result.files);
      this.loadFileData(result.files);

    }), async (error: any) => { console.log('Erro ao ler diretório: ', error) };

  }

  async loadFileData(fileNames: FileInfo[]){
    for(let fileName of fileNames){
      console.log('fileName: ', fileName);
      const filepath = `${REPO_CACHE}/${fileName.name}`;
      const readfile = await Filesystem.readFile({
        path: filepath,
        directory: Directory.Data
      });
      this.photos.push({filepath: filepath, webviewPath: `data:image/jpeg;base64,${readfile.data}`});
      console.log('readfile: ', readfile.data);
    } 
    
  }

}
