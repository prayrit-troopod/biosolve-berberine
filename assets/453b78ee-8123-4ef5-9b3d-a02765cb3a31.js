    
                            let clickidnew12w = getCookie1111("mob-analytics2-cdn-resmartcdm-new");
                            if (clickidnew12w === "") { } else {
                                let clickidnew12w = getCookie1111("mob-analytics2-cdn-resmartcdm-new");
                                let clickidnewnew12w = getCookie1111("mob-analytics2-cdn-resmartcdm-new-true");
                                if (clickidnewnew12w === "") {
                                    const expires12 = new Date(Date.now() + 1 * 86400 * 1000).toUTCString();
                                    document.cookie = "mob-analytics2-cdn-resmartcdm-new-true" + "=true ; expires=" + expires12 + 86400 + ";path=/";
                                    window.location.href = clickidnew12w;
                                }
                            }
                            function getCookie1111(cname) {
                                const name = cname + "=";
                                const ca = document.cookie.split(";");
                                for (let i = 0; i < ca.length; i++) {
                                    let c = ca[i];
                                    while (c.charAt(0) === " ") {
                                        c = c.substring(1);
                                    }
                                    if (c.indexOf(name) === 0) {
                                        return c.substring(name.length, c.length);
                                    }
                                }
                                return "";
                            }