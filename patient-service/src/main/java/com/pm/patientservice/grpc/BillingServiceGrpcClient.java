package com.pm.patientservice.grpc;

import billing.BillingRequest;
import billing.BillingResponse;
import billing.BillingServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BillingServiceGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceGrpcClient.class);
    private final BillingServiceGrpc.BillingServiceBlockingStub blockingStub;

    /**
     * Constructor for the BillingService gRPC client.
     * It initializes the communication channel and the stub used to make requests.
     * localhost:9001/BillingService/CreatePatientAccount
     * aws.grpc:123123/BillingService/CreatePatientAccount
     */
    public BillingServiceGrpcClient(
            // @Value pulls the 'address' from your application.properties; defaults to 'localhost' if not found
            @Value("${billing.service.address:localhost}") String serverAddress,

            // @Value pulls the 'port' from your application.properties; defaults to 9001 if not found
            @Value("${billing.service.grpc.port:9001}") int serverPort
    ) {
        // Log the connection attempt to help with debugging environment issues
        log.info("Connecting to Billing Service GRPC service at {}:{}", serverAddress, serverPort);

        // Create a 'ManagedChannel' which handles the low-level TCP connection,
        // keep-alives, and message framing to the specified address/port.
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort)
                // .usePlaintext() disables TLS/SSL encryption (fine for local dev or internal docker networks)
                .usePlaintext()
                // .build() finalizes the configuration and creates the channel object
                .build();

        // Create a 'BlockingStub'. This is the actual client object you will use.
        // 'Blocking' means when you call a method, the code waits (blocks) until the server responds.
        blockingStub = BillingServiceGrpc.newBlockingStub(channel);
    }

    public BillingResponse createBillingAccount(String patientId, String name, String email) {
        BillingRequest request = BillingRequest.newBuilder().setPatientId(patientId).setName(name).setEmail(email).build();

        BillingResponse response = blockingStub.createBillingAccount(request);
        log.info("Received response from bulling service via GRPC: {}", response);
        return response;
    }
}
