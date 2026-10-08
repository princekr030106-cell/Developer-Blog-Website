const cloudinary=require('../config/cloudinary');
const streamifier=require('streamifier');


const uploadImageToCloud=(buffer, folder ='blog_uploads')=>{
    return new Promise((resolve,reject)=>{
        if (!buffer){
            return reject(new Error('File buffer is required for upload.'))
        }
        const uploadStream=cloudinary.uploader.upload_stream({
            folder,
            resource_type:'image',
            format:'webp',
            transformation:[{quality:'auto:good'},{fetch_format:'auto'}],

        },
        (error,result)=>{
            if(error){
                return reject(error);
            }
            resolve(result.secure_url)
        }
        )
        streamifier.createReadStream(buffer).pipe(uploadStream);
    })
};


const deleteImageFromCloud=async(imageUrl)=>{
    try{
        if(!imageUrl){
            return null;
        }
        const urlParts=imageUrl.split('/')
        const uploadIndex=urlParts.indexOf('upload')

        if (uploadIndex===-1) return null

        const publicPathParts=urlParts.slice(uploadIndex +2)
        const fileNameWithExt=publicPathParts.join('/')
        const publicId=fileNameWithExt.substring(0,fileNameWithExt.lastIndexOf('.'))

        const result=await cloudinary.uploader.destroy(publicId)
        return result
    }
    catch(error){
        console.error('Cloudinary delete error:',error)
        throw error
    }
}

module.exports={
    uploadImageToCloud,
    deleteImageFromCloud
}