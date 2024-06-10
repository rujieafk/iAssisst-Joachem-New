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
// import pdf1 from '../../dummy.pdf'
import "react-pdf/dist/esm/Page/TextLayer.css"; 

import { Document, Page,pdfjs } from 'react-pdf'; 


 function RequestView() {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`; 

    const location = useLocation();
    const data = location.state.data;

    // console.log(data);

    const { employeeId } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [numPages, setNumPages] = useState();
    const [pageNumber, setPageNumber] = useState(1); 
    const [pdfUrl, setPdfUrl] = useState(''); 
    

    const [pdf, setPdf] = useState([]);
    const [pdfResubmit, setPdfResubmit] = useState([]);
    
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
      // try {
      //   const response = await fetch(variables.API_URL + 'UploadEmp/' + employeeId, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(employeeData)
      //   });
      //   if (!response.ok) {
      //     throw new Error('Failed to update employee');
      //   }
      //   // Handle successful update
      //   console.log('Employee updated successfully');
      // } catch (error) {
      //   console.error('Error updating employee:', error);
      // }
    }; 
    
    // Modal functions
    const handleButtonClick = (base64) => { 
      convertToPDF(base64);
      setShowModal(true);
    };
    const handleCloseModal = () => {
      setShowModal(false);
    };

    // Checkbox 
    const checkbox = (id, status) => { 
    
      const isChecked = status.target.checked;
      const index = pdf.findIndex(pdf => pdf.PdfFileID === id);
      if (index !== -1) {
        pdf[index].Resubmit = isChecked; 
        setPdf([...pdf]); 
      }
    };
    // Reason 
    const resubmitReason = (id, reason) => {  
      const reasonPDF = reason.target.value;
      const index = pdf.findIndex(pdf => pdf.PdfFileID === id);
      if (index !== -1) {
        pdf[index].ResubmitReason = reasonPDF; 
        setPdf([...pdf]); // Update the state with the modified array
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
                                <div > 
                                <div className="d-flex justify-content-between">
                                    <label>{data.Name}</label>
                                    <label>{data.DateTime}</label>
                                    <label>{data.TurnAround} Days</label>
                                    <label>{data.Status}</label>
                                    <Button>Confirm</Button>
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
                {pdf && pdf.map((pdf, index) =>
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-7">
                            <div className="card shadow mb-4">
                                {/* Card Header - New Hire Upload */}
                                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 className="m-0 font-weight-bold text-primary">{pdf.RequirementName}</h6> 
                                </div>
                                {/* Card Body - New Hire Options */}
                                <div className="card-body">
                                    <div className="tab-content">
                                        <div className="card-body">
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div> 
                                              <button onClick={() => handleButtonClick(pdf.PdfData)}>
                                                View PDF
                                              </button>
                                              <button onClick={() => convertAndDownloadPDF(pdf.PdfData,pdf.FileName)} className='btnClose'>
                                                Download
                                              </button>
                                              <label>{pdf.FileName}</label>
                                            </div>
                                            <label>{pdf.UploadDate}</label>
                                            <div> 
                                              <label for="toggle" class="toggle-label mr-2">{pdf.Updated ? 'Resubmission':'Resubmit'}</label>    
                                              {pdf.Updated ? 
                                              <label className="toggle-label mr-2">{pdf.EmpResubmitted ? '- Complete':'- Pending'}</label>
                                              :
                                              <input type="checkbox" id="toggle" class="toggle-input" onChange={(e)=>checkbox(pdf.PdfFileID, e)} 
                                                checked={pdf.Resubmit}
                                              />      
                                              }
                                            </div>
                                          </div>
                                          {pdf.Resubmit && !pdf.Updated ? 
                                            <div>
                                                {/* Card Header - New Hire Upload */}
                                                <div className="py-3 align-items-center justify-content-between">
                                                    <label className="mt-2 font-weight-bold text-primary">Reason</label>
                                                    <label className="ml-1 font-weight-bold text-danger">*</label> 
                                                </div> 
                                                <div>
                                                    <div className="">
                                                        <div className=" loan-row"> 
                                                            <div className="form-group"> <textarea 
                                                              className="form-control" 
                                                              id="remark" 
                                                              name="remark"
                                                              rows="3" 
                                                              style={{ resize: "vertical" }}
                                                              onChange={(e)=>resubmitReason(pdf.PdfFileID,e)}
                                                              value={pdf.ResubmitReason}
                                                            /> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>:''
                                          }
                                          {pdf.Updated ? 
                                          <div>
                                              {/* Card Header - New Hire Upload */}
                                              <div className="py-3 align-items-center justify-content-between">
                                                  <label className="mt-2 font-weight-bold text-danger">Reason:</label>
                                                  <label className="ml-1">{pdf.ResubmitReason}</label> 
                                              </div>  
                                          </div>:''
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
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-7">
                            <div className="card shadow mb-4">
                                {/* Card Header - New Hire Upload */}
                                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 className="m-0 font-weight-bold text-primary">Remark</h6>
                                </div>
                                {/* Card Body - New Hire Options */}
                                <div className="card-body">
                                    <div className="tab-content">
                                        <div className="card-body loan-row"> 
                                            <div className="form-group"> <textarea 
                                              className="form-control" 
                                              id="remark" 
                                              name="remark"
                                              rows="3" 
                                              style={{ resize: "vertical" }}
                                            />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Page content ends here */}
                <button type="submit" className="btn btn-primary d-block mx-auto">Submit</button>
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
      </div>
  );
}

export default RequestView;

