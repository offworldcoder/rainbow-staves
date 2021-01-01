import React from 'react';
import { useDropzone } from 'react-dropzone';
import grand from '../images/grand.jpg'

function Accept(props) {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
  } = useDropzone({
    accept: 'image/jpeg, image/png',
    getFilesFromEvent: event => myCustomFileGetter(event)
  });

  async function myCustomFileGetter(event) {
    const files = [];
    const fileList = event.dataTransfer ? event.dataTransfer.files : event.target.files;
  
    for (var i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      console.log(`file ${file}`)
      
      Object.defineProperty(file, 'myProp', {
        value: true
      });
  
      files.push(file);
    }
  
    return files;
  }

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className='container'>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop sheet music image file here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
        <p/>
        <img src={grand} alt='' />
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
    </section>
  );
}

export default Accept;
