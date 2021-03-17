function submitWebform(unique_id){
    var form=document.getElementById('web_form_'+unique_id);
    var url=form.action;
    var formData=new FormData(form);
    var webform_success=document.getElementById('webform_success_'+unique_id);
    var webform_error=document.getElementById('webform_error_'+unique_id);
    var submit_button=document.getElementById('webform_button_'+unique_id);
    webform_success.innerHTML='';
    webform_error.innerHTML='';
    submit_button.setAttribute('disabled','disabled');
    var xhr=new XMLHttpRequest();
    xhr.open('POST',url);
    xhr.send(formData);
    xhr.onload=function(){
        if(xhr.status!=200){
            webform_error.innerHTML='Error: '+xhr.statusText;
        }else{
            var data=JSON.parse(xhr.response);if(data.status==0){webform_error.innerHTML=data.error_message;}else if(data.redirect_url){location=data.redirect_url;}else if(data.success_message){var success_message=document.getElementById('success_message_'+unique_id);webform_success.innerHTML=success_message.value;var webform_elements=document.getElementsByClassName('webform_element_'+unique_id);for(let item of webform_elements){item.value='';}
var webform_elements_checkbox=document.getElementsByClassName('webform_element_checkbox_'+unique_id);for(let item of webform_elements_checkbox){item.checked=false;}}}
submit_button.removeAttribute('disabled');};xhr.onerror=function(){webform_error.innerHTML='There is a problem submitting your form. Please try again later.';submit_button.removeAttribute('disabled');};}