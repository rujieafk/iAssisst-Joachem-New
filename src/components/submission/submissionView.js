import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../navbar';
import TopNavbar from '../topnavbar';
import Footer from '../footer';
import '../../App.css';
import { variables } from '../../variables';
import { base64pdf } from '../../vblob';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import "react-pdf/dist/esm/Page/TextLayer.css"; 

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Document, Page,pdfjs } from 'react-pdf'; 


 function RequestView() {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`; 

    const location = useLocation();
    const data = location.state.data;

    // console.log(location.state.EmpID);

    const { employeeId } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [numPages, setNumPages] = useState();
    const [pageNumber, setPageNumber] = useState(1); 
    const [pdfUrl, setPdfUrl] = useState(''); 
    

    const [pdf, setPdf] = useState([]);
    const [pdfResubmit, setPdfResubmit] = useState([]);

    const [resubmitFiles, setResubmitFiles] = useState([]);
  
    // const handleResubmitPDF = (e) => {
    //   setResubmitFiles([...resubmitFiles, ...e.target.files]);
    // };

    const handleResubmitPDF = (e, requirementName, PdfFileID) => {
      // Combine the file with its corresponding RequirementName
      const thisSubmissionID = data.SubmissionID;

      const fileWithRequirementName = { file: e.target.files[0], requirementName, PdfFileID, thisSubmissionID};
      setResubmitFiles([...resubmitFiles, fileWithRequirementName]);
    };
    
    // Converts base64 to pdf
    const convertToPDF = (base64) => {
      console.log("here",base64)
      // const binaryString = atob(base64?base64:base64pdf.blobpdf2);
      const binaryString = atob(base64?base64:base64pdf.blobpdf2);

      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      } 
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob))
      return(URL.createObjectURL(blob))
    } 
    
    // Converts and download
    const convertAndDownloadPDF = (base64, fileName) => {  
      console.log(base64)
      const url = convertToPDF(base64);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };
  
    useEffect(() => { 
      getSubmissionPDF()
    }, [employeeId]); 

    // Get all pdf of a transaction
    const getSubmissionPDF = async () => {

        const formData = new FormData();
        formData.append('SubmissionID', data.SubmissionID);
        
        try {
          const uploadResponse = await fetch('http://localhost:5000/submissionpdf', {
            method: 'POST',
            body: formData,
          });
      
          if (!uploadResponse.ok) {
            console.error('Failed to upload PDF:', uploadResponse.statusText);
            return;
          }

          try {
            const responseData = await uploadResponse.json();
            const sortedData = responseData.result.sort((a, b) => {
                // First, sort by name
                if (a.RequirementName !== b.RequirementName) {
                    return a.RequirementName.localeCompare(b.RequirementName);
                } else {
                    // If names are the same, sort by the variable containing the number
                    return b.Updated - a.Updated;
                }
            }); 
            
            setPdf(sortedData);
            
          } catch (error) {
              console.error('Error parsing JSON response:', error);
          }
       
        } catch (error) {
          console.error('Error uploading PDF:', error);
        }
      }; 

      const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Check if any required field is empty
        if (resubmitFiles.length === 0) {
          // If the file is not selected, show a warning toast
          toast.warn('Please select a file to submit', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return; // Stop form submission
        }
      
        const formData = new FormData();
        resubmitFiles.forEach((file) => {
          formData.append('newPDF', file.file); // Append only the file
          formData.append('requirementName', file.requirementName.toString()); // Append the requirementName
          formData.append('PdfFileID', file.PdfFileID); // Append the PdfFileID
          formData.append('SubmissionID', file.thisSubmissionID); // Append the PdfFileID
        });


        try {
          const response = await fetch('http://localhost:5000/resubmitPDF', {
            method: 'POST',
            body: formData,
          }); 
          if (response.ok) {
            const jsonResponse = await response.json();

            console.log(jsonResponse.message);
            
            setTimeout(() => {
              window.location.reload();
            }, 2500);
            
            // Emit success toast
            toast.success('Submitted Successfully', {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setResubmitFiles([]);
          } else {
            console.error('Failed to upload PDF:', response.statusText);
              toast.error('Failed to Submit', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
          }
        } catch (error) {
          console.error('Error uploading PDF:', error);
        }
      };
      
  
    // Modal functions
    const handleButtonClick = (base64, e) => { 
      e.preventDefault();
      console.log(e);
      convertToPDF(base64);
      setShowModal(true);
    };

    const handleCloseModal = () => {
      setShowModal(false);
    };
    
    
    const handleCancel = async () => {
        const thisAction = "Cancelled"; 

        const formData = new FormData();
        formData.append('thisAction', thisAction);
        formData.append('thisSubmissionID', data.SubmissionID);

        try {
          const response = await fetch('http://localhost:5000/UpdateRequest', {
            method: 'POST',
            body: formData,
          }); 
          if (response.ok) {
            const jsonResponse = await response.json();

            console.log(jsonResponse.message);
            
            // Emit success toast
            toast.success('Submitted Successfully', {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });

            setTimeout(() => {
              window.location.href = '/submissions';
            }, 2300);

          } else {
            console.error('Failed to upload PDF:', response.statusText);
              toast.error('Failed to Submit', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
          } 
        } catch (error) {
        console.error('Error updating failed:', error);
      }
    };
 
    
    return (
      <div id="wrapper">
          <Navbar />
          <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopNavbar />
          <div className="container-fluid">
                  <div className="container-fluid">
                    <div className="row justify-content-center">
                      <h4 className="m-0 font-weight-bold text-primary header-name">{data.TransactionType}</h4>
                    </div>
                  </div>
          <div className="row justify-content-center">
            <div className="col-xl-12 col-xl-9">
            <form onSubmit={handleFormSubmit}>
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <ul className="nav nav-tabs nav-fill">
                        <li className="nav-item">
                            <a className="nav-link active " id="personalDetails-tab" data-toggle="tab" href="#personalDetails" role="tab" aria-controls="personalDetails" 
                            aria-selected="false">{data.TransactionType}</a>
                        </li> 
                    </ul>
                    </div>
                  <br/>
                    <div className="tab-content">
                      <div className="tab-pane fade show active" id="personalDetails" role="tabpanel" aria-labelledby="personalDetails-tab">
                          {/* Personal Details Form */}
                            <div className="container">
                              <div className="justify-content-center">
                                <div> 
                                  <div className="d-flex justify-content-between">
                                    <label>{data.Name}</label>
                                    <label>{data.DateTime}</label>
                                    <label>{data.TurnAround} Days</label>
                                    <label>{data.Status}</label>
                                      {data.Status === 'Pending' ? (
                                          <Button type="button" onClick={handleCancel}>Cancel</Button>
                                      ) : (
                                          <span></span>
                                      )}
                                    
                                  </div>
                                </div> 
                              </div> 
                            </div>
                        <br/> 
                      </div> 
                      {/* Add more tab content here */}
                      </div>
                </div>
                      
                {/* page content begin here */}
                {(data.LoanAppDate || data.TransactionNum || data.TypeOfDelivery ) && 
                  <div className="container-fluid">
                      <div className="row justify-content-center">
                          <div className="col-xl-8 col-lg-7">
                              <div className="card shadow mb-4">
                                  {/* Card Header - New Hire Upload */}
                                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                      <h6 className="m-0 font-weight-bold text-primary">Details</h6>
                                  </div>
                                  {/* Card Body - New Hire Options */}
                                    <div className="card-body">
                                        <div className="tab-content">
                                            <div className="card-body loan-row">
                                                {data.DateTime && 
                                                <div className="form-group">
                                                    <label>Loan Application Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control" 
                                                        value={data.LoanAppDate}
                                                        disabled
                                                    />
                                                </div>
                                                }
                                                {data.TransactionNum && 
                                                <div className="form-group">
                                                    <label htmlFor="name">Transaction Number</label>
                                                    <input type="text" className="form-control" id="name" name="name" disabled value={data.TransactionNum}/>
                                                </div>
                                                }
                                                {data.TypeOfDelivery && 
                                                <div className="form-group">
                                                    <label htmlFor="name">Type of Delivery</label>
                                                    <input type="text" className="form-control" id="name" name="name" disabled value={data.TypeOfDelivery}/>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                              </div>
                          </div>
                      </div>
                  </div>
                }
                {/* Page content ends here */}

                {/* page content begin here */}  
                {pdf && pdf.map((pdfItem, index) =>
                  <div className="container-fluid" key={index}>
                    <div className="row justify-content-center">
                      <div className="col-xl-8 col-lg-7">
                        <div className="card shadow mb-4">
                          {/* Card Header - New Hire Upload */}
                          <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">{pdfItem.RequirementName}</h6>
                            
                            <h6 className="m-0 font-weight-bold" style={{ color: 'red' }}>{pdfItem.Resubmit ? 'Resubmit' : ''}</h6>
                          </div>
                          {/* Card Body - New Hire Options */}
                          <div className="card-body">
                            <div className="tab-content">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <button onClick={(e) => handleButtonClick(pdfItem.PdfData, e)}>
                                      View PDF
                                    </button>
                                    <button onClick={() => convertAndDownloadPDF(pdfItem.PdfData, pdfItem.FileName)} className='btnClose'>
                                      Download
                                    </button>
                                    <label>{pdfItem.FileName}</label>
                                  </div>
                                  <label>Date Submitted: {pdfItem.UploadDate}</label>
                                </div>

                                {/* For Resubmission */}
                                {pdfItem.Resubmit === 1 &&
                                  <div className="d-flex justify-content-between">
                                    {pdfItem.EmpResubmitted === 0 &&
                                      <div className="d-flex justify-content-left">
                                        {/* Pass pdf.RequirementName to handleResubmitPDF */}
                                        <input type="file" className="input-file" aria-describedby="fileHelp" onChange={(e) => handleResubmitPDF(e, pdfItem.RequirementName, pdfItem.PdfFileID, location.state.EmpID, data.SubmissionID)} />
                                      </div>}
                                    <label>Reason: {pdfItem.ResubmitReason}</label>
                                  </div>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Page content ends here */}

                {/* page content begin here */}
                {/* <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-7">
                            <div className="card shadow mb-4"> 
                                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 className="m-0 font-weight-bold text-primary">*Requirement name</h6> 
                                    <h6 className="m-0 font-weight-bold">*Resubmit</h6> 
                                </div> 
                                <div className="card-body">
                                    <div className="tab-content">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between mb-2">
                                              <div> 
                                                <button onClick={handleButtonClick}>
                                                  View PDF
                                                </button>
                                                <button onClick={convertAndDownloadPDF} className='btnClose'>
                                                  Download
                                                </button>
                                              </div>
                                              <label>*File Name</label>
                                              <label>*Upload Date</label>
                                            </div>
 
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex justify-content-left">
                                                    <input type="file" className="input-file" aria-describedby="fileHelp"/> 
                                                </div> 
                                                <label>Reason: Incomplete/blurry</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                {/* Page content ends here */} 
                {data.Status === 'Resubmit' ? (
                  <button type="submit" className="btn btn-primary d-block mx-auto mb-4">Submit</button>
                ) : (
                  <span></span>
                )}
                
                </form>
              </div>

              

              </div> 
                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                  <Modal.Header>
                    <Modal.Title>*File name</Modal.Title>
                    <div>
                      <button type="button" className="btnClose" onClick={handleCloseModal}>Close</button>
                    </div>
                  </Modal.Header>
                  <Modal.Body style={{backgroundColor: 'lightgray'}}>  
                    <Document
                        file={pdfUrl} 
                        onLoadSuccess={({ numPages })=>setNumPages(numPages)} 
                    >
                        {Array.apply(null, Array(numPages))
                        .map((x, i)=>i+1)
                        .map(page => 
                          <div style={{ marginBottom: '20px' }}>
                            <Page
                              pageNumber={page}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                            />
                          </div>)}
                    </Document>
                  </Modal.Body>
                  <Modal.Footer> 
                    <div>
                      <button type="button" className="btnClose" onClick={handleCloseModal}>Close</button>
                    </div>
                  </Modal.Footer>
                </Modal>

              </div>
              </div>
              <Footer />
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      </div>
  );
}

export default RequestView;

