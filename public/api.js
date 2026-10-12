(() => {
 'use strict';
 const origin=new URL(window.GUIDE_BACKEND_ORIGIN||location.origin).origin;
 window.GUIDE_API=(path,options={})=>fetch(new URL(path,origin),{...options,credentials:'omit'});
})();
