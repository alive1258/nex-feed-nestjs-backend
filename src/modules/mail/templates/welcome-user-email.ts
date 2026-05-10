export default function WelcomeEmailTemplate(data: {
  email: string;
  password: string;
  companyName: string;
  loginUrl: string;
  supportEmail: string;
  userName: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to ${data.companyName}!</title>
    <style type="text/css">
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Client-specific styles */
        .ReadMsgBody { width: 100%; }
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
            line-height: 100%;
        }
        
        /* Mobile styles */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .mobile-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .mobile-center {
                text-align: center !important;
            }
            .mobile-hide {
                display: none !important;
            }
            .cta-button {
                width: 100% !important;
                display: block !important;
            }
            .credentials-box {
                padding: 15px !important;
            }
            .logo-text {
                font-size: 24px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <!-- Wrapper table -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Main container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with gradient background -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 0; position: relative;">
                            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 0; text-align: center; position: relative; overflow: hidden;">
                                <!-- Decorative elements -->
                                <div style="position: absolute; top: 20px; left: 80px; width: 60px; height: 60px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; transform: rotate(45deg);"></div>
                                <div style="position: absolute; top: 60px; right: 100px; width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.15); border-radius: 50%;"></div>
                                <div style="position: absolute; bottom: 30px; left: 120px; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 4px; transform: rotate(30deg);"></div>
                                <div style="position: absolute; bottom: 50px; right: 80px; width: 25px; height: 25px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                                
                                <!-- Logo/Company Name -->
                                <div style="position: relative; z-index: 10; margin-bottom: 20px;">
                                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.95); padding: 15px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                        <h1 class="logo-text" style="margin: 0; font-size: 28px; font-weight: bold; color: #4f46e5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                            🏢 ${data.companyName}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 50px;">
                            <!-- Welcome heading -->
                            <h2 style="margin: 0 0 20px 0; font-size: 32px; font-weight: bold; color: #1a202c; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                Welcome, ${data.userName}! 👋
                            </h2>
                            
                            <!-- Welcome message -->
                            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #4a5568; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                Your account has been successfully created by our administrator. We're excited to have you join our platform!
                            </p>
                            
                            <!-- Account setup notice -->
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #4a5568; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                Below are your login credentials to get started. Please log in and change your password for security.
                            </p>
                            
                            <!-- Login credentials box -->
                           
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px 50px; border-top: 1px solid #e2e8f0;" class="mobile-padding">
                            <!-- Links -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="color: #4f46e5; text-decoration: none; font-size: 12px; margin: 0 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Privacy Policy</a>
                                        <span style="color: #cbd5e0; font-size: 12px;">|</span>
                                        <a href="#" style="color: #4f46e5; text-decoration: none; font-size: 12px; margin: 0 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Terms of Service</a>
                                        <span style="color: #cbd5e0; font-size: 12px;">|</span>
                                        <a href="#" style="color: #4f46e5; text-decoration: none; font-size: 12px; margin: 0 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Help Center</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Copyright -->
                            <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                © 2025 ${data.companyName}. All rights reserved.
                            </p>
                            
                            <!-- Unsubscribe -->
                            <p style="margin: 10px 0 0 0; font-size: 11px; color: #a0aec0; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}
